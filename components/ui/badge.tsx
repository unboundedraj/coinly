import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
  amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  red: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300",
  blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300",
  slate: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
};

export type BadgeTone = keyof typeof tones;

export function Badge({ className = "", tone = "emerald", ...props }: HTMLAttributes<HTMLDivElement> & { tone?: BadgeTone }) {
  return (
    <div
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}
