"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { deleteTransaction, getTransactions } from "@/actions/finance";
import type { TransactionInput } from "@/lib/validations";
import { TransactionDialog } from "@/components/dashboard/transaction-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Transaction = Awaited<ReturnType<typeof getTransactions>>[number];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [pending, startTransition] = useTransition();

  function loadTransactions() { startTransition(() => { void getTransactions({ category: search || undefined, type: (type || undefined) as TransactionInput["type"] }).then(setTransactions).catch(() => setTransactions([])); }); }
  useEffect(() => { startTransition(() => { void getTransactions({ category: search || undefined, type: (type || undefined) as TransactionInput["type"] }).then(setTransactions).catch(() => setTransactions([])); }); }, [search, type]);

  const visibleTransactions = useMemo(() => transactions.filter((transaction) => !search || transaction.category.toLowerCase().includes(search.toLowerCase()) || transaction.description?.toLowerCase().includes(search.toLowerCase())), [transactions, search]);

  return <div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-emerald-600">Activity</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Transactions</h1><p className="mt-2 text-sm text-slate-500">Every income, expense, and transfer in one place.</p></div><TransactionDialog /></div><Card className="border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50"><CardContent className="p-4"><div className="flex flex-col gap-3 md:flex-row"><Input placeholder="Search category or description" value={search} onChange={(event) => setSearch(event.target.value)} /><Select className="md:max-w-48" value={type} onChange={(event) => setType(event.target.value)}><option value="">All types</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option><option value="TRANSFER">Transfer</option></Select></div></CardContent></Card><Card className="border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Account</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{visibleTransactions.map((transaction) => <TableRow key={transaction.id}><TableCell>{new Date(transaction.date).toLocaleDateString("en-IN")}</TableCell><TableCell><div className="font-medium text-slate-900 dark:text-white">{transaction.category}</div><div className="text-xs text-slate-400">{transaction.description}</div></TableCell><TableCell>{transaction.account.name}</TableCell><TableCell><Badge className={transaction.type === "EXPENSE" ? "border-amber-200 bg-amber-50 text-amber-700" : transaction.type === "INCOME" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700"}>{transaction.type}</Badge></TableCell><TableCell className={`text-right font-semibold ${transaction.type === "EXPENSE" ? "text-red-600" : "text-emerald-600"}`}>{transaction.type === "EXPENSE" ? "-" : "+"}₹{transaction.amount.toLocaleString("en-IN")}</TableCell><TableCell className="text-right"><Button variant="outline" className="h-8 px-3 text-xs" disabled={pending} onClick={() => startTransition(() => { void deleteTransaction(transaction.id).then(loadTransactions); })}>Delete</Button></TableCell></TableRow>)}{visibleTransactions.length === 0 && <TableRow><TableCell colSpan={6} className="h-48 text-center text-slate-400">No transactions found.</TableCell></TableRow>}</TableBody></Table></Card></div>;
}