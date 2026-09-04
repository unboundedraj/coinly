"use client";

import { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip, type ChartOptions } from "chart.js";
import type { AnalyticsBucket } from "@/lib/analytics-types";

ChartJS.register(CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

export function NetWorthChart({ buckets }: { buckets: AnalyticsBucket[] }) {
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  useEffect(() => { chartRef.current?.update(); }, [buckets]);
  const data = { labels: buckets.map((bucket) => bucket.label), datasets: [{ label: "Net worth", data: buckets.map((bucket) => bucket.netWorth), borderColor: "#10b981", backgroundColor: (context: { chart: ChartJS }) => { const { ctx, chartArea } = context.chart; if (!chartArea) return "rgba(16, 185, 129, 0.12)"; const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom); gradient.addColorStop(0, "rgba(16, 185, 129, 0.28)"); gradient.addColorStop(1, "rgba(16, 185, 129, 0)"); return gradient; }, fill: true, tension: 0.38, pointRadius: buckets.length > 30 ? 0 : 3, pointHoverRadius: 5 }] };
  const options: ChartOptions<"line"> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => ` ₹${Number(context.raw).toLocaleString("en-IN")}` } } }, scales: { x: { grid: { display: false }, ticks: { color: "#94a3b8", maxTicksLimit: 10 } }, y: { grid: { color: "rgba(148, 163, 184, 0.15)" }, ticks: { color: "#94a3b8", callback: (value) => `₹${Number(value).toLocaleString("en-IN")}` } } } };
  return <div className="h-80"><Line ref={chartRef} data={data} options={options} /></div>;
}
