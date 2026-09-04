"use client";

import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, type ChartOptions } from "chart.js";
import type { AnalyticsBucket } from "@/lib/analytics-types";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function CashFlowChart({ buckets, compact = false }: { buckets: AnalyticsBucket[]; compact?: boolean }) {
  const data = { labels: buckets.map((bucket) => bucket.label), datasets: [{ label: "Income", data: buckets.map((bucket) => bucket.income), backgroundColor: "#34d399", borderRadius: 5, maxBarThickness: compact ? 12 : 24 }, { label: "Expense", data: buckets.map((bucket) => bucket.expense), backgroundColor: "#fbbf24", borderRadius: 5, maxBarThickness: compact ? 12 : 24 }] };
  const options: ChartOptions<"bar"> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: !compact, position: "bottom", labels: { usePointStyle: true, boxWidth: 8, color: "#64748b" } }, tooltip: { callbacks: { label: (context) => ` ${context.dataset.label}: ${Number(context.raw).toLocaleString("en-IN")}` } } }, scales: { x: { grid: { display: false }, ticks: { color: "#94a3b8", maxTicksLimit: compact ? 6 : 12 } }, y: { beginAtZero: true, grid: { color: "rgba(148, 163, 184, 0.15)" }, ticks: { color: "#94a3b8", callback: (value) => `₹${Number(value).toLocaleString("en-IN")}` } } } };
  return <div className={compact ? "h-52" : "h-80"}><Bar data={data} options={options} /></div>;
}
