"use client";

import { useMemo } from "react";
import { useData } from "@/components/providers/data-provider";
import { useFilteredRecords } from "@/hooks/use-filtered-records";
import { computeKpis, groupBy } from "@/lib/metrics";
import { fmtCurrencyFull, fmtNumberFull, fmtPercent } from "@/lib/format";
import { KpiStrip } from "@/components/dashboard/kpi-card";
import { FilterPanel } from "@/components/dashboard/filter-panel";
import { DashboardSkeleton, ErrorState, EmptyState } from "@/components/dashboard/page-state";
import { ChartCard } from "@/components/charts/chart-card";
import { TopCustomers, SegmentPie } from "@/components/charts/mix-charts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export default function CustomersPage() {
  const { loading, error, reload } = useData();
  const { records } = useFilteredRecords();
  const kpis = useMemo(() => computeKpis(records), [records]);

  const customers = useMemo(() => groupBy(records, "customer"), [records]);
  const totalRev = useMemo(() => customers.reduce((a, c) => a + c.revenue, 0), [customers]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <KpiStrip kpis={kpis} />
      <FilterPanel />

      {records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Top Customers" subtitle="By revenue">
              <TopCustomers records={records} n={10} />
            </ChartCard>
            <ChartCard title="Revenue by Segment" subtitle="Consumer · Business · Corporate" delay={0.05}>
              <SegmentPie records={records} field="segment" />
            </ChartCard>
          </div>

          <Card className="card-gradient p-5">
            <h3 className="mb-4 font-semibold">Customer Contribution</h3>
            <div className="max-h-[520px] overflow-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.slice(0, 50).map((c) => (
                    <TableRow key={c.key}>
                      <TableCell className="font-medium">{c.key}</TableCell>
                      <TableCell className="tabular-nums">{fmtNumberFull(c.orders)}</TableCell>
                      <TableCell className="tabular-nums">{fmtCurrencyFull(c.revenue)}</TableCell>
                      <TableCell className="tabular-nums text-brand-success">{fmtCurrencyFull(c.profit)}</TableCell>
                      <TableCell className="tabular-nums">{fmtPercent(c.margin)}</TableCell>
                      <TableCell className="tabular-nums">{totalRev ? fmtPercent(c.revenue / totalRev) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
