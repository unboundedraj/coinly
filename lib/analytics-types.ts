export type AnalyticsTimeRange = "7d" | "30d" | "6m" | "1y" | "all";

export type AnalyticsBucket = {
  label: string;
  income: number;
  expense: number;
  netWorth: number;
};

export type AnalyticsCategory = {
  category: string;
  amount: number;
  percentage: number;
};

export type AnalyticsData = {
  timeRange: AnalyticsTimeRange;
  buckets: AnalyticsBucket[];
  categories: AnalyticsCategory[];
  summary: {
    totalInflow: number;
    totalOutflow: number;
    netSavings: number;
    topSpendingCategory: string | null;
    averageDailySpend: number;
  };
};
