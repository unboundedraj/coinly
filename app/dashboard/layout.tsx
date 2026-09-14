import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/current-user";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Middleware can only check that a session cookie exists; this verifies it is
  // actually valid, so an expired session lands on sign-in instead of rendering
  // a dashboard where every figure has silently fallen back to zero.
  const user = await getCurrentUser();
  if (!user) redirect("/logout");

  return (
    <div className="flex min-h-screen bg-[#f7faf8] dark:bg-[#071411]">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex min-w-0 flex-1 flex-col"><Header /><main className="flex-1 p-6 md:p-8">{children}</main></div>
    </div>
  );
}
