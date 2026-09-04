"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import type { AnalyticsBucket, AnalyticsCategory, AnalyticsData, AnalyticsTimeRange } from "@/lib/analytics-types";

const rangeConfig: Record<AnalyticsTimeRange, { start: (now: Date) => Date; monthly: boolean }> = {
  "7d": { start: (now) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6), monthly: false },
  "30d": { start: (now) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29), monthly: false },
  "6m": { start: (now) => new Date(now.getFullYear(), now.getMonth() - 5, 1), monthly: true },
  "1y": { start: (now) => new Date(now.getFullYear(), now.getMonth() - 11, 1), monthly: true },
  all: { start: () => new Date(2000, 0, 1), monthly: true },
};

const numberValue = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0);
const dayKey = (date: Date) => date.toISOString().slice(0, 10);
const monthKey = (date: Date) => date.toISOString().slice(0, 7);
const labelFor = (key: string, monthly: boolean) => {
  const date = monthly ? new Date(`${key}-01T00:00:00`) : new Date(`${key}T00:00:00`);
  return new Intl.DateTimeFormat("en-IN", monthly ? { month: "short", year: "numeric" } : { day: "numeric", month: "short" }).format(date);
};

function createBucketKeys(start: Date, end: Date, monthly: boolean) {
  const keys: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    keys.push(monthly ? monthKey(cursor) : dayKey(cursor));
    if (monthly) cursor.setMonth(cursor.getMonth() + 1, 1);
    else cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export async function getAnalyticsData(timeRange: AnalyticsTimeRange): Promise<AnalyticsData> {
  const user = await requireCurrentUser();
  const config = rangeConfig[timeRange] ?? rangeConfig["30d"];
  const now = new Date();
  const start = config.start(now);
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: start, lte: now }, type: { in: ["INCOME", "EXPENSE"] } },
    select: { amount: true, type: true, category: true, date: true },
    orderBy: { date: "asc" },
  });
  const accounts = await prisma.account.findMany({ where: { userId: user.id }, select: { balance: true } });
  const currentNetWorth = accounts.reduce((total, account) => total + numberValue(account.balance), 0);
  const bucketMap = new Map<string, { income: number; expense: number }>();
  const categoryMap = new Map<string, number>();
  let totalInflow = 0;
  let totalOutflow = 0;

  for (const transaction of transactions) {
    const amount = numberValue(transaction.amount);
    const key = config.monthly ? monthKey(transaction.date) : dayKey(transaction.date);
    const bucket = bucketMap.get(key) ?? { income: 0, expense: 0 };
    if (transaction.type === "INCOME") {
      bucket.income += amount;
      totalInflow += amount;
    } else {
      bucket.expense += amount;
      totalOutflow += amount;
      categoryMap.set(transaction.category, (categoryMap.get(transaction.category) ?? 0) + amount);
    }
    bucketMap.set(key, bucket);
  }

  const keys = createBucketKeys(start, now, config.monthly);
  let netWorth = currentNetWorth;
  const netWorthByKey = new Map<string, number>();
  for (let index = transactions.length - 1; index >= 0; index -= 1) {
    const transaction = transactions[index];
    const key = config.monthly ? monthKey(transaction.date) : dayKey(transaction.date);
    if (!netWorthByKey.has(key)) netWorthByKey.set(key, netWorth);
    const amount = numberValue(transaction.amount);
    netWorth += transaction.type === "INCOME" ? -amount : amount;
  }
  const buckets: AnalyticsBucket[] = keys.map((key) => {
    const values = bucketMap.get(key) ?? { income: 0, expense: 0 };
    return { label: labelFor(key, config.monthly), ...values, netWorth: netWorthByKey.get(key) ?? currentNetWorth };
  });
  let runningNetWorth = currentNetWorth;
  for (let index = buckets.length - 1; index >= 0; index -= 1) {
    if (!netWorthByKey.has(keys[index])) netWorthByKey.set(keys[index], runningNetWorth);
    runningNetWorth -= buckets[index].income - buckets[index].expense;
    buckets[index].netWorth = netWorthByKey.get(keys[index]) ?? runningNetWorth;
  }
  const categoryEntries = [...categoryMap.entries()].sort((a, b) => b[1] - a[1]);
  const categories: AnalyticsCategory[] = categoryEntries.map(([category, amount]) => ({ category, amount, percentage: totalOutflow > 0 ? (amount / totalOutflow) * 100 : 0 }));
  const dayCount = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / 86_400_000));
  return {
    timeRange,
    buckets,
    categories,
    summary: { totalInflow, totalOutflow, netSavings: totalInflow - totalOutflow, topSpendingCategory: categories[0]?.category ?? null, averageDailySpend: totalOutflow / dayCount },
  };
}
