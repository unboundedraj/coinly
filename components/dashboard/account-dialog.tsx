"use client";

import { useState } from "react";
import { createAccount } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function AccountDialog({ trigger, onCreated }: { trigger?: React.ReactNode; onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"CHECKING" | "SAVINGS" | "CREDIT_CARD" | "INVESTMENT">("CHECKING");
  const [balance, setBalance] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await createAccount({ name, type, balance: Number(balance), currency });
      setName("");
      setBalance("0");
      setOpen(false);
      onCreated?.();
    } catch (accountError) {
      setError(accountError instanceof Error ? accountError.message : "Unable to create account.");
    } finally {
      setPending(false);
    }
  }

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger>{trigger || <Button><span className="mr-2">+</span>Add Account</Button>}</DialogTrigger><DialogContent><DialogTitle>Add an account</DialogTitle><DialogDescription>Track a checking account, card, savings pot, or investment account.</DialogDescription><form className="mt-6 space-y-4" onSubmit={submit}><FormField label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. HDFC Checking" required /></FormField><FormField label="Type"><Select value={type} onChange={(event) => setType(event.target.value as typeof type)}><option value="CHECKING">CHECKING</option><option value="SAVINGS">SAVINGS</option><option value="CREDIT_CARD">CREDIT_CARD</option><option value="INVESTMENT">INVESTMENT</option></Select></FormField><FormField label="Initial balance"><Input type="number" step="0.01" value={balance} onChange={(event) => setBalance(event.target.value)} required /></FormField><FormField label="Currency"><Input maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} required /></FormField>{error && <p className="text-sm text-red-600">{error}</p>}<Button className="w-full" type="submit" disabled={pending}>{pending ? "Creating..." : "Create account"}</Button></form></DialogContent></Dialog>;
}