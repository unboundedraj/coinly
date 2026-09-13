import type { AnalyticsTimeRange } from "@/lib/analytics-types";

export type ParsedTransaction = {
  amount: number;
  type: "EXPENSE" | "INCOME";
  category: string;
  description: string;
  suggestedAccountType?: string;
};

export type SpendingAudit = {
  month: number;
  year: number;
  status: "Healthy" | "Caution" | "Critical";
  score: number;
  insight: string;
  actions: string[];
};

export type AdvisorMessage = { role: "user" | "model"; text: string };
export type AdvisorRange = AnalyticsTimeRange;
