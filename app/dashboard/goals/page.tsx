"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Target, Trash2 } from "lucide-react";
import { deleteGoal, getGoals } from "@/actions/goals";
import { ContributeGoalDialog } from "@/components/dashboard/contribute-goal-dialog";
import { GoalDialog } from "@/components/dashboard/goal-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Goal = Awaited<ReturnType<typeof getGoals>>[number];

const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [, startTransition] = useTransition();

  function loadGoals() { startTransition(() => { void getGoals().then(setGoals).catch(() => setGoals([])); }); }
  useEffect(() => { loadGoals(); }, []);

  const totals = useMemo(() => goals.reduce((acc, goal) => ({ target: acc.target + goal.targetAmount, saved: acc.saved + goal.currentAmount }), { target: 0, saved: 0 }), [goals]);

  return <div className="mx-auto max-w-7xl space-y-6">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium text-emerald-600">Working toward something</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Goals</h1>
        <p className="mt-2 text-sm text-slate-500">Set a target, then chip away at it from any account.</p>
      </div>
      <GoalDialog onCreated={loadGoals} />
    </section>

    <section className="grid gap-4 sm:grid-cols-2">
      <Card className="border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50"><CardContent className="p-5"><p className="text-sm text-slate-500">Total savings target</p><p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{formatMoney(totals.target)}</p></CardContent></Card>
      <Card className="border-emerald-200 bg-emerald-50/70 shadow-none dark:border-emerald-900 dark:bg-emerald-950/30"><CardContent className="p-5"><p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total saved</p><p className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950 dark:text-emerald-100">{formatMoney(totals.saved)}</p></CardContent></Card>
    </section>

    {goals.length === 0 ? <Card className="border-dashed shadow-none dark:border-slate-800 dark:bg-slate-950/50"><CardContent className="flex min-h-64 flex-col items-center justify-center text-center"><div className="rounded-full bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50"><Target className="h-6 w-6" /></div><h2 className="mt-4 font-semibold text-slate-900 dark:text-white">No goals yet</h2><p className="mt-2 max-w-sm text-sm text-slate-500">Create a goal to start setting money aside with intention.</p><GoalDialog onCreated={loadGoals} trigger={<Button className="mt-5">Create your first goal</Button>} /></CardContent></Card> : <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {goals.map((goal) => {
        const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
        const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
        const reached = percentage >= 100;
        return <Card key={goal.id} className="border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{goal.name}</h3>
                <p className="mt-1 text-xs text-slate-400">{goal.deadline ? `Target date: ${new Date(goal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "No target date set"}</p>
              </div>
              <button type="button" aria-label="Delete goal" className="text-slate-300 hover:text-red-600" onClick={() => startTransition(() => { void deleteGoal(goal.id).then(loadGoals); })}><Trash2 className="h-4 w-4" /></button>
            </div>
            <Progress value={percentage} indicatorClassName={reached ? "bg-emerald-500" : "bg-emerald-500"} className="mt-5" />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">{formatMoney(goal.currentAmount)} saved</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">of {formatMoney(goal.targetAmount)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{reached ? "Goal reached 🎉" : `${formatMoney(remaining)} remaining`}</p>
            <div className="mt-4"><ContributeGoalDialog goalId={goal.id} goalName={goal.name} onContributed={loadGoals} /></div>
          </CardContent>
        </Card>;
      })}
    </section>}
  </div>;
}
