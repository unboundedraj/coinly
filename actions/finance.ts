"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import { Prisma, type AccountType, type TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { transactionSchema, type TransactionInput } from "@/lib/validations";

const accountTypeSchema = z.enum(["CHECKING", "SAVINGS", "CREDIT_CARD", "INVESTMENT"]);
const decimal = (value: Prisma.Decimal | number) => Number(value);
const serializeAccount = (account: { id: string; name: string; type: AccountType; balance: Prisma.Decimal; currency: string }) => ({ ...account, balance: decimal(account.balance) });

export async function getAccounts() {
  const user = await requireCurrentUser();
  const accounts = await prisma.account.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
  return accounts.map(serializeAccount);
}

export async function createAccount(data: { name: string; type: AccountType; balance: number; currency?: string }) {
  const user = await requireCurrentUser();
  const input = z.object({ name: z.string().trim().min(1).max(80), type: accountTypeSchema, balance: z.coerce.number().finite(), currency: z.string().length(3).default(user.currency) }).parse(data);
  const account = await prisma.account.create({ data: { userId: user.id, name: input.name, type: input.type, balance: input.balance, currency: input.currency } });
  revalidatePath("/dashboard");
  return serializeAccount(account);
}

export async function getTransactions(filters?: { accountId?: string; category?: string; type?: TransactionType; startDate?: Date; endDate?: Date }) {
  const user = await requireCurrentUser();
  const transactions = await prisma.transaction.findMany({ where: { userId: user.id, accountId: filters?.accountId, category: filters?.category ? { contains: filters.category, mode: "insensitive" } : undefined, type: filters?.type, date: filters?.startDate || filters?.endDate ? { gte: filters.startDate, lte: filters.endDate } : undefined }, include: { account: { select: { id: true, name: true, currency: true } } }, orderBy: { date: "desc" }, take: 100 });
  return transactions.map((transaction) => ({ ...transaction, amount: decimal(transaction.amount) }));
}

export async function createTransaction(data: TransactionInput) {
  const user = await requireCurrentUser();
  const input = transactionSchema.parse(data);
  const amount = new Prisma.Decimal(input.amount);

  await prisma.$transaction(async (tx) => {
    const source = await tx.account.findFirst({ where: { id: input.accountId, userId: user.id } });
    if (!source) throw new Error("Source account not found.");

    if (input.type === "TRANSFER") {
      const destination = await tx.account.findFirst({ where: { id: input.destinationAccountId, userId: user.id } });
      if (!destination) throw new Error("Destination account not found.");
      const transferReference = `transfer:${randomUUID()}`;
      const description = [input.description, transferReference].filter(Boolean).join(" ");
      await tx.transaction.create({ data: { userId: user.id, accountId: source.id, amount, type: "TRANSFER", category: input.category, description, date: input.date, isRecurring: input.isRecurring } });
      await tx.transaction.create({ data: { userId: user.id, accountId: destination.id, amount, type: "TRANSFER", category: input.category, description, date: input.date, isRecurring: input.isRecurring } });
      await tx.account.update({ where: { id: source.id }, data: { balance: { decrement: amount } } });
      await tx.account.update({ where: { id: destination.id }, data: { balance: { increment: amount } } });
      return;
    }

    await tx.transaction.create({ data: { userId: user.id, accountId: source.id, amount, type: input.type, category: input.category, description: input.description || null, date: input.date, isRecurring: input.isRecurring } });
    await tx.account.update({ where: { id: source.id }, data: { balance: input.type === "INCOME" ? { increment: amount } : { decrement: amount } } });
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/budgets");
}

export async function deleteTransaction(id: string) {
  const user = await requireCurrentUser();
  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findFirst({ where: { id, userId: user.id } });
    if (!transaction) throw new Error("Transaction not found.");
    await tx.transaction.delete({ where: { id: transaction.id } });
    if (transaction.type === "INCOME") await tx.account.update({ where: { id: transaction.accountId }, data: { balance: { decrement: transaction.amount } } });
    if (transaction.type === "EXPENSE") await tx.account.update({ where: { id: transaction.accountId }, data: { balance: { increment: transaction.amount } } });
    if (transaction.type === "TRANSFER") {
      const reference = transaction.description?.match(/transfer:[0-9a-f-]+/)?.[0];
      const paired = reference ? await tx.transaction.findFirst({ where: { userId: user.id, id: { not: transaction.id }, type: "TRANSFER", description: { contains: reference } } }) : null;
      await tx.account.update({ where: { id: transaction.accountId }, data: { balance: { increment: transaction.amount } } });
      if (paired) {
        await tx.transaction.delete({ where: { id: paired.id } });
        await tx.account.update({ where: { id: paired.accountId }, data: { balance: { decrement: paired.amount } } });
      }
    }
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/budgets");
}

export async function getBudgets(month: number, year: number) {
  const user = await requireCurrentUser();
  const budgets = await prisma.budget.findMany({ where: { userId: user.id, month, year }, orderBy: { category: "asc" } });
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const expenses = await prisma.transaction.groupBy({ by: ["category"], where: { userId: user.id, type: "EXPENSE", date: { gte: start, lt: end } }, _sum: { amount: true } });
  const spendByCategory = new Map(expenses.map((expense) => [expense.category, decimal(expense._sum.amount ?? 0)]));
  return budgets.map((budget) => ({ ...budget, monthlyLimit: decimal(budget.monthlyLimit), spent: spendByCategory.get(budget.category) ?? 0 }));
}

export async function upsertBudget(category: string, monthlyLimit: number, month: number, year: number) {
  const user = await requireCurrentUser();
  const input = z.object({ category: z.string().trim().min(1).max(80), monthlyLimit: z.coerce.number().positive(), month: z.number().int().min(1).max(12), year: z.number().int().min(2000).max(2100) }).parse({ category, monthlyLimit, month, year });
  const budget = await prisma.budget.upsert({ where: { userId_category_month_year: { userId: user.id, category: input.category, month: input.month, year: input.year } }, update: { monthlyLimit: input.monthlyLimit }, create: { userId: user.id, category: input.category, monthlyLimit: input.monthlyLimit, month: input.month, year: input.year } });
  revalidatePath("/dashboard/budgets");
  return { ...budget, monthlyLimit: decimal(budget.monthlyLimit) };
}