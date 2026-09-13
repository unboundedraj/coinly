"use client";

import { useState } from "react";
import { createGoal } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function GoalDialog({ trigger, triggerLabel = "New Goal", onCreated }: { trigger?: React.ReactNode; triggerLabel?: string; onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await createGoal({ name, targetAmount: Number(targetAmount), deadline: deadline || null });
      setName("");
      setTargetAmount("");
      setDeadline("");
      setOpen(false);
      onCreated?.();
    } catch (goalError) {
      setError(goalError instanceof Error ? goalError.message : "Unable to create goal.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger || <Button><span className="mr-2">+</span>{triggerLabel}</Button>}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Set a financial goal</DialogTitle>
        <DialogDescription>Give it a name, a target, and an optional date to work toward.</DialogDescription>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <FormField label="Goal name"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Emergency fund" required /></FormField>
          <FormField label="Target amount"><Input type="number" step="0.01" min="0.01" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} required /></FormField>
          <FormField label="Target date (optional)"><Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></FormField>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" type="submit" disabled={pending}>{pending ? "Saving..." : "Create goal"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
