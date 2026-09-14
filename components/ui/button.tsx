import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

const variants = {
  // Brand-forward in dark mode, where a slate-900 fill would disappear into the background.
  default: "bg-slate-900 text-white hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-900",
};

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
