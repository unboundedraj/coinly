"use client";

import { createContext, useContext, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const DropdownContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>;
}

export function DropdownMenuTrigger({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(DropdownContext);
  return <button type="button" className={className} onClick={() => context?.setOpen(!context.open)} {...props}>{children}</button>;
}

export function DropdownMenuContent({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  const context = useContext(DropdownContext);
  if (!context?.open) return null;
  return <div className={cn("absolute right-0 top-full z-50 mt-2 min-w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-950", className)} {...props}>{children}</div>;
}

export function DropdownMenuItem({ children, className = "", onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(DropdownContext);
  return <button type="button" className={cn("flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900", className)} onClick={(event) => { onClick?.(event); context?.setOpen(false); }} {...props}>{children}</button>;
}