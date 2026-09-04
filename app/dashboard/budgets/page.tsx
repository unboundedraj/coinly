"use client";

import { useEffect, useState, useTransition } from "react";
import { getBudgets, upsertBudget } from "@/actions/finance";
import { BudgetCard } from "@/components/dashboard/budget-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Budget = Awaited<ReturnType<typeof getBudgets>>[number];
const categories = ["Food", "Housing", "Transport", "Shopping", "Health", "Entertainment", "Other"];

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [category, setCategory] = useState("Food");
  const [limit, setLimit] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => { startTransition(() => { void getBudgets(month, year).then(setBudgets).catch(() => setBudgets([])); }); }, [month, year]);
  async function saveBudget(event: React.FormEvent) { event.preventDefault(); await upsertBudget(category, Number(limit), month, year); setLimit(""); startTransition(() => { void getBudgets(month, year).then(setBudgets).catch(() => setBudgets([])); }); }

  return <div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-emerald-600">Planning</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Budgets</h1><p className="mt-2 text-sm text-slate-500">Give every category a number that feels intentional.</p></div><Dialog><DialogTrigger><Button>Set Budget</Button></DialogTrigger><DialogContent><DialogTitle>Set a monthly budget</DialogTitle><DialogDescription>Choose a category and spending limit for the selected month.</DialogDescription><form className="mt-6 space-y-4" onSubmit={saveBudget}><Select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</Select><Input type="number" min="1" step="0.01" placeholder="Monthly limit" value={limit} onChange={(event) => setLimit(event.target.value)} required /><Button className="w-full" disabled={pending}>Save budget</Button></form></DialogContent></Dialog></div><div className="flex gap-3"><Select className="max-w-44" value={month} onChange={(event) => setMonth(Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(2000, index).toLocaleString("en-IN", { month: "long" })}</option>)}</Select><Select className="max-w-32" value={year} onChange={(event) => setYear(Number(event.target.value))}><option>{year - 1}</option><option>{year}</option><option>{year + 1}</option></Select></div><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{budgets.map((budget) => <BudgetCard key={budget.id} category={budget.category} spent={budget.spent} limit={budget.monthlyLimit} />)}{budgets.length === 0 && <Card className="sm:col-span-2 lg:col-span-3 border-dashed shadow-none dark:bg-slate-950/50"><CardContent className="flex min-h-48 items-center justify-center text-center text-sm text-slate-400">No budgets set for this month yet.</CardContent></Card>}</section></div>;
}