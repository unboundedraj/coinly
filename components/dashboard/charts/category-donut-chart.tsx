"use client";

import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip, type ChartOptions } from "chart.js";
import type { AnalyticsCategory } from "@/lib/analytics-types";

ChartJS.register(ArcElement, Tooltip, Legend);
const colors = ["#34d399", "#60a5fa", "#fbbf24", "#fb7185", "#a78bfa", "#2dd4bf", "#94a3b8"];

export function CategoryDonutChart({ categories }: { categories: AnalyticsCategory[] }) {
  const data = { labels: categories.map((item) => `${item.category} (${item.percentage.toFixed(0)}%)`), datasets: [{ data: categories.map((item) => item.amount), backgroundColor: categories.map((_, index) => colors[index % colors.length]), borderWidth: 0, hoverOffset: 5 }] };
  const options: ChartOptions<"doughnut"> = { responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { position: "right", labels: { usePointStyle: true, pointStyle: "circle", padding: 14, color: "#64748b", font: { size: 11 } } }, tooltip: { callbacks: { label: (context) => ` ${context.label}: ₹${Number(context.raw).toLocaleString("en-IN")}` } } } };
  return <div className="h-72"><Doughnut data={data} options={options} /></div>;
}
