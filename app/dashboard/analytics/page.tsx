import { getAnalyticsData } from "@/actions/analytics";
import { AnalyticsView } from "@/components/dashboard/analytics-view";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData("30d").catch(() => ({ timeRange: "30d" as const, buckets: [], categories: [], summary: { totalInflow: 0, totalOutflow: 0, netSavings: 0, topSpendingCategory: null, averageDailySpend: 0 } }));
  return <div className="mx-auto max-w-7xl space-y-6"><header><p className="text-sm font-medium text-emerald-600">Patterns in your money</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Analytics</h1><p className="mt-2 text-sm text-slate-500">Understand the habits behind your balances.</p></header><AnalyticsView initialData={data} /></div>;
}
