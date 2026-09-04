import {
  BarChart3,
  Bot,
  CircleDollarSign,
  Goal,
  LayoutDashboard,
  ReceiptText,
  WalletCards,
} from "lucide-react";

export const dashboardNavigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/dashboard/transactions", icon: ReceiptText },
  { label: "Budgets", href: "/dashboard/budgets", icon: WalletCards },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Goals", href: "/dashboard/goals", icon: Goal },
  { label: "Investments", href: "/dashboard/investments", icon: CircleDollarSign },
  { label: "AI Assistant", href: "/dashboard/ai", icon: Bot },
];