import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f7faf8] dark:bg-[#071411]">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex min-w-0 flex-1 flex-col"><Header /><main className="flex-1 p-6 md:p-8">{children}</main></div>
    </div>
  );
}