"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { generateSpendingAudit } from "@/actions/ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SpendingAudit } from "@/lib/ai-types";

export function AIHealthAudit() {
  const now = new Date();
  const auditMonth = now.getMonth() + 1;
  const auditYear = now.getFullYear();
  const [audit, setAudit] = useState<SpendingAudit | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function regenerate() {
    setError("");
    startTransition(() => { void generateSpendingAudit(now.getMonth() + 1, now.getFullYear()).then(setAudit).catch((auditError) => setError(auditError instanceof Error ? auditError.message : "Unable to generate audit.")); });
  }
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      startTransition(() => { void generateSpendingAudit(auditMonth, auditYear).then(setAudit).catch((auditError) => setError(auditError instanceof Error ? auditError.message : "Unable to generate audit.")); });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [auditMonth, auditYear]);

  const statusClass = audit?.status === "Critical" ? "border-red-200 bg-red-50 text-red-700" : audit?.status === "Caution" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return <Card className="border-emerald-200/70 bg-emerald-50/30 shadow-none dark:border-emerald-900 dark:bg-emerald-950/20"><CardHeader className="flex flex-row items-start justify-between"><div><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-600" /><h2 className="font-semibold text-slate-950 dark:text-white">AI health audit</h2></div><p className="mt-1 text-sm text-slate-500">A concise read on this month’s money habits.</p></div><Button variant="outline" className="h-9 w-9 p-0" aria-label="Regenerate analysis" onClick={regenerate} disabled={pending}><RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} /></Button></CardHeader><CardContent>{error ? <p className="text-sm text-red-600">{error}</p> : !audit || pending ? <p className="text-sm text-slate-500">{pending ? "Analyzing your spending..." : "Add transactions to generate an audit."}</p> : <><div className="flex items-center justify-between"><Badge className={statusClass}>{audit.status} · {audit.score}/100</Badge><span className="text-xs text-slate-400">AI generated</span></div><p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">{audit.insight}</p><ol className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">{audit.actions.map((action, index) => <li key={action}><span className="mr-2 font-semibold text-emerald-600">{index + 1}.</span>{action}</li>)}</ol></>}</CardContent></Card>;
}
