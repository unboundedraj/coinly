"use server";

import { ApiError, GoogleGenAI } from "@google/genai";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import type { AdvisorMessage, AiResult, ParsedTransaction, SpendingAudit } from "@/lib/ai-types";

const parsedTransactionSchema = z.object({ amount: z.number().positive(), type: z.enum(["EXPENSE", "INCOME"]), category: z.string().min(1).max(80), description: z.string().min(1).max(240), suggestedAccountType: z.string().max(40).optional() });
const auditSchema = z.object({ status: z.enum(["Healthy", "Caution", "Critical"]), score: z.number().int().min(0).max(100), insight: z.string().min(1).max(500), actions: z.array(z.string().min(1).max(240)).length(3) });

/** An error whose message is written for the end user and is safe to show as-is. */
class AiUserError extends Error {}

function gemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new AiUserError("The AI service isn't configured on the server (GEMINI_API_KEY is missing).");
  return new GoogleGenAI({ apiKey });
}

function parseJson<T>(text: string, schema: z.ZodType<T>): T {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return schema.parse(JSON.parse(cleaned));
}

/** Maps any failure to a message that is useful to the user without leaking internals. */
function describeError(error: unknown): string {
  if (error instanceof AiUserError) return error.message;
  // Thrown by requireCurrentUser(); safe and actionable.
  if (error instanceof Error && /session has expired|must be signed in|profile was not found/i.test(error.message)) return error.message;
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return `The AI provider rejected the API key (HTTP ${error.status}). Check GEMINI_API_KEY and any key restrictions.`;
    if (error.status === 404) return "The AI model couldn't be found (HTTP 404). Check the model name and that the key can access it.";
    if (error.status === 429) return "The AI provider's usage limit was reached (HTTP 429). Try again shortly.";
    return `The AI provider returned an error (HTTP ${error.status}).`;
  }
  if (error instanceof z.ZodError || error instanceof SyntaxError) return "The AI returned a response in an unexpected format. Please try again.";
  return `The AI request failed (${error instanceof Error ? error.name : "UnknownError"}).`;
}

async function run<T>(label: string, task: () => Promise<T>): Promise<AiResult<T>> {
  try {
    return { ok: true, data: await task() };
  } catch (error) {
    console.error(`[ai:${label}] failed:`, error);
    return { ok: false, error: describeError(error) };
  }
}

export async function parseTransactionText(input: string): Promise<AiResult<ParsedTransaction>> {
  return run("parseTransactionText", async () => {
    await requireCurrentUser();
    const text = input.trim();
    if (!text || text.length > 500) throw new AiUserError("Enter a short transaction description.");
    const response = await gemini().models.generateContent({ model: "gemini-3.6-flash", contents: `Parse this personal finance note into JSON only: "${text}". Infer whether it is income or expense, a concise category, and an account type if mentioned. Use amount as a number. JSON keys: amount, type, category, description, suggestedAccountType.`, config: { temperature: 0.1, responseMimeType: "application/json" } });
    return parseJson(response.text ?? "", parsedTransactionSchema);
  });
}

export async function generateSpendingAudit(month: number, year: number): Promise<AiResult<SpendingAudit>> {
  return run("generateSpendingAudit", async () => {
    const user = await requireCurrentUser();
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const [transactions, budgets] = await Promise.all([
      prisma.transaction.findMany({ where: { userId: user.id, date: { gte: start, lt: end }, type: { in: ["INCOME", "EXPENSE"] } }, select: { amount: true, type: true, category: true } }),
      prisma.budget.findMany({ where: { userId: user.id, month, year }, select: { category: true, monthlyLimit: true } }),
    ]);
    const income = transactions.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + Number(item.amount), 0);
    const expenses = transactions.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + Number(item.amount), 0);
    const byCategory = new Map<string, number>();
    for (const item of transactions.filter((transaction) => transaction.type === "EXPENSE")) byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + Number(item.amount));
    const categorySpending = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).map(([category, amount]) => ({ category, amount }));
    const budgetLimits = budgets.map((budget) => ({ category: budget.category, limit: Number(budget.monthlyLimit) }));
    const response = await gemini().models.generateContent({ model: "gemini-3.6-flash", contents: `Return JSON only with keys status (Healthy, Caution, Critical), score (0-100), insight, and actions (exactly 3 strings). Analyze this anonymized monthly summary for ${month}/${year}: income ${income.toFixed(2)}, expenses ${expenses.toFixed(2)}, spending by category ${JSON.stringify(categorySpending)}, budget limits ${JSON.stringify(budgetLimits)}. Identify one spending spike or anomaly and give three prioritized savings actions.`, config: { temperature: 0.2, responseMimeType: "application/json" } });
    return { month, year, ...parseJson(response.text ?? "", auditSchema) };
  });
}

export async function chatWithAdvisor(messages: AdvisorMessage[]): Promise<AiResult<string>> {
  return run("chatWithAdvisor", async () => {
    const user = await requireCurrentUser();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const [accounts, expenses] = await Promise.all([
      prisma.account.aggregate({ where: { userId: user.id }, _sum: { balance: true } }),
      prisma.transaction.groupBy({ by: ["category"], where: { userId: user.id, type: "EXPENSE", date: { gte: start } }, _sum: { amount: true }, orderBy: { _sum: { amount: "desc" } }, take: 3 }),
    ]);
    const context = `Current month context: net worth ${Number(accounts._sum.balance ?? new Prisma.Decimal(0)).toFixed(2)}; top expense categories ${JSON.stringify(expenses.map((item) => ({ category: item.category, amount: Number(item._sum.amount ?? 0) })))}. Answer clearly and briefly, and never invent account data.`;
    const response = await gemini().models.generateContent({ model: "gemini-3.6-flash", contents: [{ role: "user", parts: [{ text: context }] }, ...messages.map((message) => ({ role: message.role, parts: [{ text: message.text }] }))] });
    return response.text?.trim() || "I couldn't generate an answer right now.";
  });
}
