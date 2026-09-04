"use client";

import { createContext, useContext, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SheetContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function Sheet({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(SheetContext);
  return <button type="button" onClick={() => context?.setOpen(true)} {...props}>{children}</button>;
}

export function SheetContent({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  const context = useContext(SheetContext);
  if (!context?.open) return null;
  return <div className="fixed inset-0 z-50 bg-slate-950/30" onClick={() => context.setOpen(false)}><div className={cn("h-full w-80 bg-white p-6 shadow-2xl dark:bg-slate-950", className)} onClick={(event) => event.stopPropagation()} {...props}><button aria-label="Close menu" className="absolute right-4 top-4 text-slate-500" onClick={() => context.setOpen(false)}><X className="h-5 w-5" /></button>{children}</div></div>;
}