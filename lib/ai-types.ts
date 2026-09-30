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

/** AI actions return failures instead of throwing: production masks thrown server-action errors (React #441). */
export type AiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type AdvisorMessage = { role: "user" | "model"; text: string };
export type AdvisorRange = AnalyticsTimeRange;
