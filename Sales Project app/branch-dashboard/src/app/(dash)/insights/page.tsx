"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useData } from "@/components/providers/data-provider";
import { useFilteredRecords } from "@/hooks/use-filtered-records";
import { computeKpis } from "@/lib/metrics";
import { KpiStrip } from "@/components/dashboard/kpi-card";
import { FilterPanel } from "@/components/dashboard/filter-panel";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { DashboardSkeleton, ErrorState, EmptyState } from "@/components/dashboard/page-state";
import { Card } from "@/components/ui/card";

export default function InsightsPage() {
  const { loading, error, reload } = useData();
  const { records } = useFilteredRecords();
  const kpis = useMemo(() => computeKpis(records), [records]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <Card className="gradient-primary overflow-hidden p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-lg font-bold">AI Business Insights</h1>
            <p className="text-sm text-white/80">Automatically generated from your live selection — updates with every filter.</p>
          </div>
        </div>
      </Card>

      <KpiStrip kpis={kpis} />
      <FilterPanel />

      {records.length === 0 ? <EmptyState /> : <InsightsPanel records={records} columns={2} />}
    </div>
  );
}
