"use client";

import { useState } from "react";
import { createInvestment } from "@/actions/investments";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const assetTypes = ["STOCK", "CRYPTO", "MUTUAL_FUND", "GOLD"] as const;

export function InvestmentDialog({ trigger, triggerLabel = "Add Investment", onCreated }: { trigger?: React.ReactNode; triggerLabel?: string; onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [assetType, setAssetType] = useState<(typeof assetTypes)[number]>("STOCK");
  const [units, setUnits] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await createInvestment({
        symbol,
        assetType,
        units: Number(units),
        buyPrice: Number(buyPrice),
        currentPrice: currentPrice ? Number(currentPrice) : undefined,
      });
      setSymbol("");
      setUnits("");
      setBuyPrice("");
      setCurrentPrice("");
      setOpen(false);
      onCreated?.();
    } catch (investmentError) {
      setError(investmentError instanceof Error ? investmentError.message : "Unable to add investment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger || <Button><span className="mr-2">+</span>{triggerLabel}</Button>}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Record an investment</DialogTitle>
        <DialogDescription>Log a stock, crypto, mutual fund, or gold holding to track its performance.</DialogDescription>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <FormField label="Symbol"><Input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} placeholder="e.g. AAPL, BTC" required /></FormField>
          <FormField label="Asset type"><Select value={assetType} onChange={(event) => setAssetType(event.target.value as typeof assetType)}>{assetTypes.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}</Select></FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Units"><Input type="number" step="0.0001" min="0.0001" value={units} onChange={(event) => setUnits(event.target.value)} required /></FormField>
            <FormField label="Buy price"><Input type="number" step="0.01" min="0.01" value={buyPrice} onChange={(event) => setBuyPrice(event.target.value)} required /></FormField>
          </div>
          <FormField label="Current price (optional)"><Input type="number" step="0.01" min="0.01" placeholder="Defaults to buy price" value={currentPrice} onChange={(event) => setCurrentPrice(event.target.value)} /></FormField>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" type="submit" disabled={pending}>{pending ? "Saving..." : "Save investment"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
