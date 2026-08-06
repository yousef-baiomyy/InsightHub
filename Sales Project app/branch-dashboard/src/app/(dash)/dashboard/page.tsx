"use client";

import { useMemo } from "react";
import { useData } from "@/components/providers/data-provider";
import { useFilteredRecords } from "@/hooks/use-filtered-records";
import { useAuth } from "@/stores/auth";
import { isManager } from "@/lib/auth";
import { computeKpis } from "@/lib/metrics";
import { KpiGrid } from "@/components/dashboard/kpi-card";
import { FilterPanel } from "@/components/dashboard/filter-panel";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { DashboardSkeleton, ErrorState, EmptyState } from "@/components/dashboard/page-state";
import { ExportButtons } from "@/components/reports/export-buttons";
import { ChartCard } from "@/components/charts/chart-card";
import { RevenueTrend, RevenueVsProfit } from "@/components/charts/revenue-charts";
import { BranchBars, BranchShareDonut } from "@/components/charts/branch-charts";
import { CategoryBar } from "@/components/charts/category-charts";
import { TopProducts, TopCustomers } from "@/components/charts/mix-charts";

export default function DashboardPage() {
  const { loading, error, reload } = useData();
  const { records } = useFilteredRecords();
  const user = useAuth((s) => s.user);
  const manager = isManager(user);
  const kpis = useMemo(() => computeKpis(records), [records]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">
            Welcome back, <span className="text-gradient">{user?.displayName?.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {manager ? "Company-wide performance across all branches." : `Performance for the ${user?.branch} branch.`}
          </p>
        </div>
        <ExportButtons records={records} kpis={kpis} />
      </div>

      <KpiGrid kpis={kpis} />
      <FilterPanel />

      {records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Revenue Trend" subtitle="Monthly net sales">
              <RevenueTrend records={records} />
            </ChartCard>
            <ChartCard title="Revenue vs Profit" subtitle="Monthly comparison" delay={0.05}>
              <RevenueVsProfit records={records} />
            </ChartCard>
          </div>

          {manager && (
            <div className="grid gap-4 lg:grid-cols-3">
              <ChartCard title="Revenue by Branch" className="lg:col-span-2">
                <BranchBars records={records} metric="revenue" />
              </ChartCard>
              <ChartCard title="Branch Revenue Share" delay={0.05}>
                <BranchShareDonut records={records} />
              </ChartCard>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Top Categories" subtitle="By revenue">
              <CategoryBar records={records} />
            </ChartCard>
            <ChartCard title="Top 10 Products" subtitle="By revenue" delay={0.05}>
              <TopProducts records={records} />
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Top Customers" subtitle="By revenue contribution">
              <TopCustomers records={records} />
            </ChartCard>
            <ChartCard title="AI Insights" subtitle="Auto-generated from your data" delay={0.05}>
              <InsightsPanel records={records} columns={1} />
            </ChartCard>
          </div>

          <ChartCard title="Recent Transactions" subtitle="Latest orders in the current view">
            <RecentTransactions records={records} limit={8} />
          </ChartCard>
        </>
      )}
    </div>
  );
}
