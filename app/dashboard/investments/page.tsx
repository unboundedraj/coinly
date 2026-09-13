"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";
import { deleteInvestment, getInvestments } from "@/actions/investments";
import { InvestmentDialog } from "@/components/dashboard/investment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Investment = Awaited<ReturnType<typeof getInvestments>>[number];

const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [pending, startTransition] = useTransition();

  function loadInvestments() { startTransition(() => { void getInvestments().then(setInvestments).catch(() => setInvestments([])); }); }
  useEffect(() => { loadInvestments(); }, []);

  const rows = useMemo(() => investments.map((investment) => {
    const currentPrice = investment.currentPrice ?? investment.buyPrice;
    const invested = investment.units * investment.buyPrice;
    const currentValue = investment.units * currentPrice;
    const pnl = currentValue - invested;
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
    return { ...investment, currentPrice, invested, currentValue, pnl, pnlPercent };
  }), [investments]);

  const totals = useMemo(() => rows.reduce((acc, row) => ({ invested: acc.invested + row.invested, currentValue: acc.currentValue + row.currentValue }), { invested: 0, currentValue: 0 }), [rows]);
  const totalPnl = totals.currentValue - totals.invested;
  const totalPnlPercent = totals.invested > 0 ? (totalPnl / totals.invested) * 100 : 0;

  const metrics = [
    { label: "Total Invested", value: formatMoney(totals.invested), icon: Wallet, tone: "text-slate-950 dark:text-white" },
    { label: "Current Value", value: formatMoney(totals.currentValue), icon: TrendingUp, tone: "text-slate-950 dark:text-white" },
    { label: "Overall Return", value: `${totalPnl >= 0 ? "+" : ""}${formatMoney(totalPnl)} (${totalPnlPercent >= 0 ? "+" : ""}${totalPnlPercent.toFixed(1)}%)`, icon: totalPnl >= 0 ? ArrowUpRight : ArrowDownRight, tone: totalPnl >= 0 ? "text-emerald-600" : "text-red-600" },
  ];

  return <div className="mx-auto max-w-7xl space-y-6">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium text-emerald-600">Your holdings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Investments</h1>
        <p className="mt-2 text-sm text-slate-500">Track stocks, crypto, mutual funds, and gold in one portfolio view.</p>
      </div>
      <InvestmentDialog onCreated={loadInvestments} />
    </section>

    <section className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => { const Icon = metric.icon; return <Card key={metric.label} className="border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50"><CardContent className="p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{metric.label}</p><span className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-slate-900"><Icon className="h-4 w-4" /></span></div><p className={`mt-5 text-2xl font-semibold tracking-tight ${metric.tone}`}>{metric.value}</p></CardContent></Card>; })}
    </section>

    <Card className="border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Units</TableHead>
            <TableHead className="text-right">Avg Buy Price</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Total P&amp;L</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => <TableRow key={row.id}>
            <TableCell className="font-medium text-slate-900 dark:text-white">{row.symbol}</TableCell>
            <TableCell><Badge>{row.assetType.replace("_", " ")}</Badge></TableCell>
            <TableCell className="text-right">{row.units}</TableCell>
            <TableCell className="text-right">{formatMoney(row.buyPrice)}</TableCell>
            <TableCell className="text-right">{formatMoney(row.currentPrice)}</TableCell>
            <TableCell className={`text-right font-semibold ${row.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>{row.pnl >= 0 ? "+" : ""}{formatMoney(row.pnl)} ({row.pnlPercent >= 0 ? "+" : ""}{row.pnlPercent.toFixed(1)}%)</TableCell>
            <TableCell className="text-right"><Button variant="outline" className="h-8 px-3 text-xs" disabled={pending} onClick={() => startTransition(() => { void deleteInvestment(row.id).then(loadInvestments); })}>Delete</Button></TableCell>
          </TableRow>)}
          {rows.length === 0 && <TableRow><TableCell colSpan={7} className="h-48 text-center text-slate-400">No investments yet. Add your first holding to start tracking returns.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Card>
  </div>;
}
