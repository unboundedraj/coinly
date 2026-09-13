"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { parseTransactionText } from "@/actions/ai";
import { getAccounts } from "@/actions/finance";
import { TransactionDialog } from "@/components/dashboard/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TransactionInput } from "@/lib/validations";

export function AIQuickAdd() {
  const [text, setText] = useState("");
  const [prefill, setPrefill] = useState<Partial<TransactionInput>>();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function parse() {
    setPending(true);
    setError("");
    try {
      const [parsed, accounts] = await Promise.all([parseTransactionText(text), getAccounts()]);
      const preferredType = parsed.suggestedAccountType?.toUpperCase();
      const account = accounts.find((item) => preferredType && item.type === preferredType) ?? accounts[0];
      if (!account) throw new Error("Create an account before using AI Quick Add.");
      setPrefill({ accountId: account.id, amount: parsed.amount, type: parsed.type, category: parsed.category, description: parsed.description, date: new Date().toISOString().slice(0, 10), isRecurring: false });
      setOpen(true);
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "I couldn't parse that transaction.");
    } finally {
      setPending(false);
    }
  }

  return <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900 dark:bg-emerald-950/20"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-2"><Sparkles className="h-5 w-5 shrink-0 text-emerald-600" /><Input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void parse(); }} placeholder="e.g., Lunch at Chipotle 18 from Checking" className="border-0 bg-transparent shadow-none focus:ring-0" /></div><Button type="button" onClick={() => void parse()} disabled={pending || !text.trim()}>{pending ? "Parsing..." : "Parse with AI"}</Button></div>{error && <p className="mt-2 px-2 text-xs text-red-600">{error}</p>}<TransactionDialog open={open} onOpenChange={setOpen} initialValues={prefill} trigger={<span className="hidden" />} /></div>;
}
