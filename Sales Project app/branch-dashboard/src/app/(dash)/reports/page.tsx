"use client";

import { useMemo } from "react";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { useData } from "@/components/providers/data-provider";
import { useFilteredRecords } from "@/hooks/use-filtered-records";
import { computeKpis } from "@/lib/metrics";
import { exportExcel, exportPdf } from "@/lib/export";
import { fmtCurrencyFull, fmtNumberFull, fmtPercent } from "@/lib/format";
import { KpiStrip } from "@/components/dashboard/kpi-card";
import { FilterPanel } from "@/components/dashboard/filter-panel";
import { DashboardSkeleton, ErrorState, EmptyState } from "@/components/dashboard/page-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const { loading, error, reload } = useData();
  const { records } = useFilteredRecords();
  const kpis = useMemo(() => computeKpis(records), [records]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const cards = [
    { title: "Export to PDF", desc: "Executive summary with KPIs and a transaction sample.", icon: FileDown, action: () => exportPdf(records, kpis), variant: "default" as const },
    { title: "Export to Excel", desc: "Full filtered dataset as a formatted .xlsx workbook.", icon: FileSpreadsheet, action: () => exportExcel(records), variant: "secondary" as const },
    { title: "Print Dashboard", desc: "Send the current report straight to your printer.", icon: Printer, action: () => window.print(), variant: "outline" as const },
  ];

  return (
    <div className="space-y-6">
      <KpiStrip kpis={kpis} />
      <FilterPanel />

      {records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.title} className="card-gradient flex flex-col p-6">
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.desc}</p>
                  <Button variant={c.variant} className="mt-4 w-full" onClick={c.action}>
                    <Icon className="h-4 w-4" /> {c.title.split(" ")[0]}
                  </Button>
                </Card>
              );
            })}
          </div>

          <Card className="card-gradient p-5">
            <h3 className="mb-3 font-semibold">Report Preview</h3>
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              {[
                ["Records in scope", fmtNumberFull(records.length)],
                ["Total Revenue", fmtCurrencyFull(kpis.totalRevenue)],
                ["Total Profit", fmtCurrencyFull(kpis.totalProfit)],
                ["Profit Margin", fmtPercent(kpis.profitMargin)],
                ["Total Orders", fmtNumberFull(kpis.totalOrders)],
                ["Total Customers", fmtNumberFull(kpis.totalCustomers)],
                ["Best Product", kpis.bestProduct],
                ["Best Category", kpis.bestCategory],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border/60 bg-card/50 p-3">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="mt-0.5 font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
