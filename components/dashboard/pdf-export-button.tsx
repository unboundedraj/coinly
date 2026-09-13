"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAnalyticsData } from "@/actions/analytics";
import { getAccounts, getTransactions } from "@/actions/finance";
import { getInvestments } from "@/actions/investments";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

type DocWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };

export function PDFExportButton() {
  const { user } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function exportStatement() {
    setError("");
    setPending(true);
    try {
      const [analytics, transactions, investments, accounts] = await Promise.all([
        getAnalyticsData("all"),
        getTransactions(),
        getInvestments(),
        getAccounts(),
      ]);
      const currency = accounts[0]?.currency || "INR";
      const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
      const portfolioValue = investments.reduce((sum, investment) => sum + investment.units * (investment.currentPrice ?? investment.buyPrice), 0);

      const doc = new jsPDF() as DocWithAutoTable;
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("Coinly Financial Statement", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, 14, 27);
      doc.text(user?.displayName || user?.email || "Coinly user", 14, 32);
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.6);
      doc.line(14, 36, pageWidth - 14, 36);

      autoTable(doc, {
        startY: 42,
        head: [["Metric", "Value"]],
        body: [
          ["Total Income", formatMoney(analytics.summary.totalInflow)],
          ["Total Expenses", formatMoney(analytics.summary.totalOutflow)],
          ["Net Savings", formatMoney(analytics.summary.netSavings)],
          ["Total Portfolio Value", formatMoney(portfolioValue)],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 },
      });

      const categoryStartY = (doc.lastAutoTable?.finalY ?? 42) + 12;
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Category Breakdown", 14, categoryStartY);
      autoTable(doc, {
        startY: categoryStartY + 4,
        head: [["Category", "Amount", "% of Spend"]],
        body: analytics.categories.length > 0
          ? analytics.categories.map((category) => [category.category, formatMoney(category.amount), `${category.percentage.toFixed(1)}%`])
          : [["No expense categories yet", "-", "-"]],
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 10 },
      });

      const transactionsStartY = (doc.lastAutoTable?.finalY ?? categoryStartY) + 12;
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Recent High-Value Transactions", 14, transactionsStartY);
      const highValueTransactions = [...transactions].sort((a, b) => b.amount - a.amount).slice(0, 10);
      autoTable(doc, {
        startY: transactionsStartY + 4,
        head: [["Date", "Category", "Account", "Type", "Amount"]],
        body: highValueTransactions.length > 0
          ? highValueTransactions.map((transaction) => [
              new Date(transaction.date).toLocaleDateString("en-IN"),
              transaction.category,
              transaction.account.name,
              transaction.type,
              formatMoney(transaction.amount),
            ])
          : [["No transactions yet", "-", "-", "-", "-"]],
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 10 },
      });

      doc.save(`coinly-statement-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Unable to generate PDF statement.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={() => void exportStatement()} disabled={pending}>
        <FileDown className="mr-2 h-4 w-4" />
        {pending ? "Preparing..." : "Export PDF"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
