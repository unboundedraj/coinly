"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { dashboardNavigation } from "@/components/dashboard/navigation";
import { Wordmark } from "@/components/ui/wordmark";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white/75 px-4 py-6 dark:border-slate-800 dark:bg-slate-950/70">
      <Link href="/dashboard" className="mb-10 flex items-center px-3" onClick={onNavigate} aria-label="Coinly dashboard">
        <Wordmark size="sm" />
      </Link>
      <nav className="space-y-1" aria-label="Dashboard navigation">
        {dashboardNavigation.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-700")} />
              {item.label}
              {item.label === "AI Assistant" && <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-50" />}
            </Link>
          );
        })}
      </nav>
      <div className="relative mt-auto overflow-hidden rounded-2xl bg-slate-950 p-4 text-white dark:bg-emerald-950/60">
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">Your money, clearer</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">A calmer view of what you have and where it goes.</p>
        </div>
      </div>
    </aside>
  );
}