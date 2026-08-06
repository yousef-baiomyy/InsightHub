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
import { TopProducts, BottomProducts } from "@/components/charts/mix-charts";
import { CategoryBar, CategoryTreemap } from "@/components/charts/category-charts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export default function ProductsPage() {
  const { loading, error, reload } = useData();
  const { records } = useFilteredRecords();
  const kpis = useMemo(() => computeKpis(records), [records]);
  const products = useMemo(() => groupBy(records, "product"), [records]);

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
            <ChartCard title="Top 10 Products" subtitle="By revenue">
              <TopProducts records={records} n={10} />
            </ChartCard>
            <ChartCard title="Bottom 10 Products" subtitle="Lowest performers" delay={0.05}>
              <BottomProducts records={records} n={10} />
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Category Performance" subtitle="Revenue by category">
              <CategoryBar records={records} />
            </ChartCard>
            <ChartCard title="Product Treemap" subtitle="Relative contribution" delay={0.05}>
              <CategoryTreemap records={records} />
            </ChartCard>
          </div>

          <Card className="card-gradient p-5">
            <h3 className="mb-4 font-semibold">Product Performance</h3>
            <div className="max-h-[520px] overflow-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.key}>
                      <TableCell className="font-medium">{p.key}</TableCell>
                      <TableCell className="tabular-nums">{fmtNumberFull(p.quantity)}</TableCell>
                      <TableCell className="tabular-nums">{fmtNumberFull(p.orders)}</TableCell>
                      <TableCell className="tabular-nums">{fmtCurrencyFull(p.revenue)}</TableCell>
                      <TableCell className="tabular-nums text-brand-success">{fmtCurrencyFull(p.profit)}</TableCell>
                      <TableCell className="tabular-nums">{fmtPercent(p.margin)}</TableCell>
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
