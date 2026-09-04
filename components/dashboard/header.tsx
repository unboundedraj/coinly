"use client";

import { Menu, Moon, Settings, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/sidebar";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Guest";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/65 px-5 backdrop-blur md:px-8 dark:border-slate-800 dark:bg-slate-950/65">
      <Sheet>
        <SheetTrigger className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-900" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent>
          <Sidebar />
        </SheetContent>
      </Sheet>
      <div className="hidden md:block">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Personal finance</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your financial command center</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          className="h-10 w-10 rounded-full p-0"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </Button>
        <Separator className="mx-2 hidden h-7 w-px md:block" />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Open profile menu">
            <Avatar className="h-9 w-9"><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <span className="hidden text-left md:block"><span className="block max-w-28 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{displayName}</span><span className="block text-xs text-slate-400">USD</span></span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="px-3 py-2"><p className="text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p><p className="mt-0.5 max-w-48 truncate text-xs text-slate-500">{user?.email || "Not signed in"}</p></div>
            <Separator className="my-1" />
            <DropdownMenuItem><UserRound className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
            <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 hover:text-red-700" onClick={() => void logout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}