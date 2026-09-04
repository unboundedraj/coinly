import { ArrowDownRight, ArrowUpRight, Bot, CalendarDays, Plus, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const metrics = [
  { label: "Net Worth", value: "₹8,42,680", change: "+8.2%", tone: "emerald", icon: Wallet },
  { label: "Monthly Income", value: "₹1,24,500", change: "+12.4%", tone: "blue", icon: ArrowUpRight },
  { label: "Monthly Expenses", value: "₹68,240", change: "-4.8%", tone: "amber", icon: ArrowDownRight },
  { label: "Savings Rate", value: "45.2%", change: "+6.1%", tone: "violet", icon: CalendarDays },
];

export default function DashboardPage() {
  const date = new Intl.DateTimeFormat("en-IN", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><Badge>Friday, September 4</Badge><h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">Good morning, Raj.</h1><p className="mt-2 text-sm text-slate-500">{date} · Here is your financial snapshot.</p></div>
        <div className="flex flex-wrap gap-3"><Button variant="outline"><Bot className="mr-2 h-4 w-4" />Ask AI</Button><Button><Plus className="mr-2 h-4 w-4" />Add Transaction</Button></div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => { const Icon = metric.icon; return <Card key={metric.label} className="border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50"><CardContent className="p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{metric.label}</p><span className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-slate-900"><Icon className="h-4 w-4" /></span></div><p className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{metric.value}</p><p className="mt-2 text-xs font-medium text-emerald-600">{metric.change} <span className="font-normal text-slate-400">vs last month</span></p></CardContent></Card>; })}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50"><CardHeader className="flex flex-row items-center justify-between"><div><h2 className="font-semibold text-slate-950 dark:text-white">Recent transactions</h2><p className="mt-1 text-sm text-slate-500">Your latest money movements</p></div><Button variant="outline" className="h-9 text-xs">View all</Button></CardHeader><CardContent><div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center dark:border-slate-800"><div className="rounded-full bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50"><Wallet className="h-5 w-5" /></div><p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Your transactions will appear here</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">Connect an account or add your first transaction to start tracking.</p></div></CardContent></Card>
        <Card className="border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50"><CardHeader><h2 className="font-semibold text-slate-950 dark:text-white">Quick analytics</h2><p className="mt-1 text-sm text-slate-500">Spending trend this month</p></CardHeader><CardContent><div className="flex min-h-64 items-end gap-3 rounded-xl bg-slate-50 px-5 pb-5 pt-8 dark:bg-slate-900/60">{[32, 52, 42, 68, 48, 76, 60, 88, 64, 80, 72, 92].map((height, index) => <div key={index} className="flex flex-1 flex-col justify-end gap-2"><div className="w-full rounded-t-md bg-emerald-400/75" style={{ height: `${height}%` }} /><span className="text-center text-[10px] text-slate-400">{index + 1}</span></div>)}</div></CardContent></Card>
      </section>
    </div>
  );
}