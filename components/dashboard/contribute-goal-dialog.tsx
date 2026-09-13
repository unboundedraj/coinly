"use client";

import { useEffect, useState } from "react";
import { contributeToGoal } from "@/actions/goals";
import { getAccounts } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type AccountOption = Awaited<ReturnType<typeof getAccounts>>[number];

export function ContributeGoalDialog({ goalId, goalName, onContributed }: { goalId: string; goalName: string; onContributed?: () => void }) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    void getAccounts().then((items) => {
      setAccounts(items);
      setAccountId((current) => current || items[0]?.id || "");
    }).catch(() => setAccounts([]));
  }, [open]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!accountId) { setError("Add an account before contributing."); return; }
    setPending(true);
    try {
      await contributeToGoal(goalId, Number(amount), accountId);
      setAmount("");
      setOpen(false);
      onContributed?.();
    } catch (contributeError) {
      setError(contributeError instanceof Error ? contributeError.message : "Unable to record contribution.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger><Button variant="outline" className="h-9 px-4 text-sm">Contribute</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle>Contribute to &ldquo;{goalName}&rdquo;</DialogTitle>
        <DialogDescription>Move money from one of your accounts toward this goal.</DialogDescription>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <FormField label="From account">
            <Select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
              <option value="">Select account</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Amount"><Input type="number" step="0.01" min="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></FormField>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" type="submit" disabled={pending || accounts.length === 0}>{pending ? "Contributing..." : "Confirm contribution"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
