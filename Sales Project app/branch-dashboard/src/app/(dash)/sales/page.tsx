"use client";

import { useMemo } from "react";
import { useData } from "@/components/providers/data-provider";
import { useFilteredRecords } from "@/hooks/use-filtered-records";
import { computeKpis } from "@/lib/metrics";
import { KpiStrip } from "@/components/dashboard/kpi-card";
import { FilterPanel } from "@/components/dashboard/filter-panel";
import { DashboardSkeleton, ErrorState, EmptyState } from "@/components/dashboard/page-state";
import { ExportButtons } from "@/components/reports/export-buttons";
import { ChartCard } from "@/components/charts/chart-card";
import { RevenueTrend } from "@/components/charts/revenue-charts";
import { PaymentDonut, SegmentPie } from "@/components/charts/mix-charts";
import { SalesTable } from "@/components/data-table/data-table";
import { Card } from "@/components/ui/card";

export default function SalesPage() {
  const { loading, error, reload } = useData();
  const { records } = useFilteredRecords();
  const kpis = useMemo(() => computeKpis(records), [records]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between">
        <KpiStrip kpis={kpis} />
      </div>
      <FilterPanel />

      {records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Revenue Trend" subtitle="Monthly" className="lg:col-span-1">
              <RevenueTrend records={records} height={240} />
            </ChartCard>
            <ChartCard title="Payment Methods" subtitle="Revenue split" delay={0.05}>
              <PaymentDonut records={records} height={240} />
            </ChartCard>
            <ChartCard title="Sales Channels" subtitle="Revenue split" delay={0.1}>
              <SegmentPie records={records} field="channel" height={240} />
            </ChartCard>
          </div>

          <Card className="card-gradient p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Transactions</h3>
                <p className="text-xs text-muted-foreground">Sortable, searchable, paginated</p>
              </div>
              <ExportButtons records={records} kpis={kpis} />
            </div>
            <SalesTable records={records} />
          </Card>
        </>
      )}
    </div>
  );
}
