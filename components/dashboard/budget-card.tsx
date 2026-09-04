import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BudgetCard({ category, spent, limit }: { category: string; spent: number; limit: number }) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const color = percentage >= 100 ? "bg-red-500" : percentage >= 80 ? "bg-amber-500" : "bg-emerald-500";
  return <Card className="border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50"><CardContent className="p-5"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900 dark:text-white">{category}</h3><span className={cn("text-xs font-semibold", percentage >= 100 ? "text-red-600" : percentage >= 80 ? "text-amber-600" : "text-emerald-600")}>{Math.round(percentage)}%</span></div><Progress value={percentage} indicatorClassName={color} className="mt-5" /><div className="mt-3 flex justify-between text-sm"><span className="text-slate-500">₹{spent.toLocaleString("en-IN")} spent</span><span className="font-medium text-slate-700 dark:text-slate-300">₹{limit.toLocaleString("en-IN")}</span></div></CardContent></Card>;
}