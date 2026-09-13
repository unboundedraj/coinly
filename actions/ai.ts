"use server";

import { GoogleGenAI } from "@google/genai";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import type { AdvisorMessage, ParsedTransaction, SpendingAudit } from "@/lib/ai-types";

const parsedTransactionSchema = z.object({ amount: z.number().positive(), type: z.enum(["EXPENSE", "INCOME"]), category: z.string().min(1).max(80), description: z.string().min(1).max(240), suggestedAccountType: z.string().max(40).optional() });
const auditSchema = z.object({ status: z.enum(["Healthy", "Caution", "Critical"]), score: z.number().int().min(0).max(100), insight: z.string().min(1).max(500), actions: z.array(z.string().min(1).max(240)).length(3) });

function gemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  return new GoogleGenAI({ apiKey });
}

function parseJson<T>(text: string, schema: z.ZodType<T>): T {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return schema.parse(JSON.parse(cleaned));
}

export async function parseTransactionText(input: string): Promise<ParsedTransaction> {
  await requireCurrentUser();
  const text = input.trim();
  if (!text || text.length > 500) throw new Error("Enter a short transaction description.");
  const response = await gemini().models.generateContent({ model: "gemini-3.6-flash", contents: `Parse this personal finance note into JSON only: "${text}". Infer whether it is income or expense, a concise category, and an account type if mentioned. Use amount as a number. JSON keys: amount, type, category, description, suggestedAccountType.`, config: { temperature: 0.1, responseMimeType: "application/json" } });
  return parseJson(response.text ?? "", parsedTransactionSchema);
}

export async function generateSpendingAudit(month: number, year: number): Promise<SpendingAudit> {
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
}

export async function chatWithAdvisor(messages: AdvisorMessage[]): Promise<string> {
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
}
