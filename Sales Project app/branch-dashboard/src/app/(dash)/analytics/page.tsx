"use client";

import { useMemo } from "react";
import { useData } from "@/components/providers/data-provider";
import { useFilteredRecords } from "@/hooks/use-filtered-records";
import { useAuth } from "@/stores/auth";
import { isManager } from "@/lib/auth";
import { computeKpis } from "@/lib/metrics";
import { KpiStrip } from "@/components/dashboard/kpi-card";
import { FilterPanel } from "@/components/dashboard/filter-panel";
import { DashboardSkeleton, ErrorState, EmptyState } from "@/components/dashboard/page-state";
import { ChartCard } from "@/components/charts/chart-card";
import { DailySales, RevenueVsProfit } from "@/components/charts/revenue-charts";
import { BranchMonthHeatmap } from "@/components/charts/branch-charts";
import { CategoryTreemap, CategoryStackedByBranch } from "@/components/charts/category-charts";
import { QuantityProfitScatter, SegmentPie } from "@/components/charts/mix-charts";

export default function AnalyticsPage() {
  const { loading, error, reload } = useData();
  const { records } = useFilteredRecords();
  const user = useAuth((s) => s.user);
  const manager = isManager(user);
  const kpis = useMemo(() => computeKpis(records), [records]);

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
            <ChartCard title="Product Revenue Treemap" subtitle="Relative product contribution">
              <CategoryTreemap records={records} />
            </ChartCard>
            <ChartCard title="Quantity vs Profit" subtitle="Bubble size = revenue" delay={0.05}>
              <QuantityProfitScatter records={records} />
            </ChartCard>
          </div>

          {manager && (
            <ChartCard title="Revenue Heatmap" subtitle="Branch × month intensity">
              <BranchMonthHeatmap records={records} />
            </ChartCard>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Category by Branch" subtitle="Stacked revenue">
              <CategoryStackedByBranch records={records} />
            </ChartCard>
            <ChartCard title="Daily Sales" subtitle="Granular revenue by day" delay={0.05}>
              <DailySales records={records} />
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Revenue by Segment" subtitle="Customer segments">
              <SegmentPie records={records} field="segment" />
            </ChartCard>
            <ChartCard title="Revenue vs Profit" subtitle="Monthly" delay={0.05}>
              <RevenueVsProfit records={records} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
