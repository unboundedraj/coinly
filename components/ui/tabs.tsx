"use client";

import { createContext, useContext, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext<{ value: string; setValue: (value: string) => void } | null>(null);
export function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) { const [value, setValue] = useState(defaultValue); return <TabsContext.Provider value={{ value, setValue }}>{children}</TabsContext.Provider>; }
export function TabsList({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900", className)} {...props} />; }
export function TabsTrigger({ value, className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) { const context = useContext(TabsContext); return <button type="button" className={cn("rounded-md px-3 py-1.5 text-sm text-slate-500 transition-colors data-[active=true]:bg-white data-[active=true]:font-medium data-[active=true]:text-slate-900 data-[active=true]:shadow-sm dark:data-[active=true]:bg-slate-800 dark:data-[active=true]:text-white", className)} data-active={context?.value === value} onClick={() => context?.setValue(value)} {...props}>{children}</button>; }