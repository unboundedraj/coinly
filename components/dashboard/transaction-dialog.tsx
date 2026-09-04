"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createTransaction, getAccounts } from "@/actions/finance";
import { transactionSchema, type TransactionInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountDialog } from "@/components/dashboard/account-dialog";
import { Card, CardContent } from "@/components/ui/card";

type AccountOption = Awaited<ReturnType<typeof getAccounts>>[number];

export function TransactionDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const form = useForm<TransactionInput>({ resolver: zodResolver(transactionSchema), defaultValues: { type: "EXPENSE", amount: 0, category: "Food", date: new Date().toISOString().slice(0, 10), isRecurring: false } });
  const type = form.watch("type");

  useEffect(() => { if (open) void getAccounts().then(setAccounts).catch(() => setAccounts([])); }, [open]);

  async function submit(values: TransactionInput) {
    setSubmitError("");
    setSuccessMessage("");
    try { await createTransaction(values); form.reset({ type: "EXPENSE", amount: 0, category: "Food", date: new Date().toISOString().slice(0, 10), isRecurring: false }); setOpen(false); setSuccessMessage("Transaction added successfully"); } catch (error) { setSubmitError(error instanceof Error ? error.message : "Unable to save transaction."); }
  }

  useEffect(() => {
    if (!successMessage) return;
    const timeout = window.setTimeout(() => setSuccessMessage(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  if (open && accounts.length === 0) return <Dialog open><DialogTrigger>{trigger || <Button><span className="mr-2">+</span>Add Transaction</Button>}</DialogTrigger><DialogContent><DialogTitle>Add an account first</DialogTitle><DialogDescription>Transactions need an account to update. Create one in a few seconds.</DialogDescription><Card className="mt-5 border-dashed shadow-none dark:border-slate-800 dark:bg-slate-900/40"><CardContent className="flex flex-col items-center p-6 text-center"><p className="text-sm text-slate-500">No financial accounts are connected yet.</p><AccountDialog onCreated={() => { void getAccounts().then(setAccounts); setOpen(false); }} trigger={<Button className="mt-4">Create account</Button>} /></CardContent></Card></DialogContent></Dialog>;
  return <><Dialog><DialogTrigger onClick={() => { setOpen(true); setSuccessMessage(""); }}>{trigger || <Button><span className="mr-2">+</span>Add Transaction</Button>}</DialogTrigger><DialogContent><DialogTitle>Log a transaction</DialogTitle><DialogDescription>Keep your account balances and spending history current.</DialogDescription><form className="mt-6 space-y-4" onSubmit={form.handleSubmit(submit)}><Tabs defaultValue="EXPENSE"><TabsList className="grid w-full grid-cols-3"><TabsTrigger value="INCOME" onClick={() => form.setValue("type", "INCOME")}>Income</TabsTrigger><TabsTrigger value="EXPENSE" onClick={() => form.setValue("type", "EXPENSE")}>Expense</TabsTrigger><TabsTrigger value="TRANSFER" onClick={() => form.setValue("type", "TRANSFER")}>Transfer</TabsTrigger></TabsList></Tabs><FormField label="Account" error={form.formState.errors.accountId?.message}><Select {...form.register("accountId")}><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</Select></FormField>{type === "TRANSFER" && <FormField label="Destination account" error={form.formState.errors.destinationAccountId?.message}><Select {...form.register("destinationAccountId")}><option value="">Select destination</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</Select></FormField>}<div className="grid gap-4 sm:grid-cols-2"><FormField label="Amount" error={form.formState.errors.amount?.message}><Input type="number" step="0.01" min="0.01" {...form.register("amount", { valueAsNumber: true })} /></FormField><FormField label="Date" error={form.formState.errors.date?.message}><Input type="date" {...form.register("date")} /></FormField></div><div className="grid gap-4 sm:grid-cols-2"><FormField label="Category" error={form.formState.errors.category?.message}><Select {...form.register("category")}><option>Food</option><option>Housing</option><option>Transport</option><option>Shopping</option><option>Health</option><option>Entertainment</option><option>Salary</option><option>Other</option></Select></FormField><FormField label="Description"><Input placeholder="Optional note" {...form.register("description")} /></FormField></div><label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" {...form.register("isRecurring")} />Recurring transaction</label>{submitError && <p className="text-sm text-red-600">{submitError}</p>}<div className="flex justify-end gap-3 pt-2"><DialogClose className="rounded-lg px-4 py-2 text-sm text-slate-500">Cancel</DialogClose><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save transaction"}</Button></div></form></DialogContent></Dialog>{successMessage && <div role="status" className="fixed bottom-6 right-6 z-[60] rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">{successMessage}</div>}</>;
}