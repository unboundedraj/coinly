import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Avatar({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}

export function AvatarFallback({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex h-full w-full items-center justify-center bg-emerald-100 text-sm font-semibold text-emerald-800", className)} {...props} />;
}