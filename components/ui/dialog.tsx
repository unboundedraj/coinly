"use client";

import { X } from "lucide-react";
import { createContext, useContext, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

const DialogContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function Dialog({ children, open: controlledOpen, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (nextOpen: boolean) => {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(DialogContext);
  const open = () => context?.setOpen(true);
  if (isValidElement<ButtonHTMLAttributes<HTMLButtonElement>>(children)) {
    return cloneElement(children, { suppressHydrationWarning: true, onClick: (event) => { onClick?.(event); children.props.onClick?.(event); open(); } });
  }
  return <button type="button" onClick={(event) => { onClick?.(event); open(); }} {...props}>{children}</button>;
}

export function DialogContent({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  const context = useContext(DialogContext);
  if (!context?.open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => context.setOpen(false)}><div className={cn("relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950", className)} onClick={(event) => event.stopPropagation()} {...props}><button type="button" aria-label="Close dialog" className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 dark:hover:text-white" onClick={() => context.setOpen(false)}><X className="h-4 w-4" /></button>{children}</div></div>;
}

export function DialogTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-slate-950 dark:text-white", className)} {...props} />;
}

export function DialogDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-slate-500", className)} {...props} />;
}

export function DialogClose({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(DialogContext);
  return <button type="button" onClick={() => context?.setOpen(false)} {...props}>{children}</button>;
}