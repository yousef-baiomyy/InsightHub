"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Crown, TrendingUp, Gem, Zap } from "lucide-react";
import { useData } from "@/components/providers/data-provider";
import { useFilteredRecords } from "@/hooks/use-filtered-records";
import { BRANCH_COLORS, branchStats } from "@/lib/metrics";
import { fmtCurrencyFull, fmtNumberFull, fmtPercent, fmtSigned } from "@/lib/format";
import { DashboardSkeleton, ErrorState, EmptyState } from "@/components/dashboard/page-state";
import { FilterPanel } from "@/components/dashboard/filter-panel";
import { ChartCard } from "@/components/charts/chart-card";
import { BranchBars } from "@/components/charts/branch-charts";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ComparisonPage() {
  const { loading, error, reload } = useData();
  const { records } = useFilteredRecords();
  const stats = useMemo(() => branchStats(records), [records]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (records.length === 0) return <><FilterPanel /><EmptyState /></>;

  const byRevenue = [...stats].sort((a, b) => b.revenue - a.revenue);
  const byGrowth = [...stats].sort((a, b) => b.growth - a.growth);
  const byMargin = [...stats].sort((a, b) => b.margin - a.margin);

  const highlights = [
    { label: "Best Performing", value: stats[0]?.branch, sub: `Score ${stats[0]?.score}/100`, icon: Crown, accent: "#F59E0B" },
    { label: "Fastest Growing", value: byGrowth[0]?.branch, sub: fmtSigned(byGrowth[0]?.growth ?? 0), icon: Zap, accent: "#06B6D4" },
    { label: "Most Profitable", value: byMargin[0]?.branch, sub: `${fmtPercent(byMargin[0]?.margin ?? 0)} margin`, icon: Gem, accent: "#10B981" },
    { label: "Top Revenue", value: byRevenue[0]?.branch, sub: fmtCurrencyFull(byRevenue[0]?.revenue ?? 0), icon: TrendingUp, accent: "#2563EB" },
  ];

  return (
    <div className="space-y-6">
      <FilterPanel />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {highlights.map((h, i) => {
          const Icon = h.icon;
          return (
            <motion.div key={h.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="card-gradient overflow-hidden p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Icon className="h-4 w-4" style={{ color: h.accent }} /> {h.label}
                </div>
                <p className="mt-2 text-xl font-bold">{h.value}</p>
                <p className="text-xs text-muted-foreground">{h.sub}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Performance score bars */}
      <Card className="card-gradient p-5">
        <h3 className="mb-4 font-semibold">Performance Score</h3>
        <div className="space-y-4">
          {stats.map((s, i) => (
            <div key={s.branch}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                  {s.branch}
                </span>
                <span className="font-semibold tabular-nums">{s.score}/100</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.score}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: BRANCH_COLORS[s.branch] }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue by Branch">
          <BranchBars records={records} metric="revenue" />
        </ChartCard>
        <ChartCard title="Profit by Branch" delay={0.05}>
          <BranchBars records={records} metric="profit" />
        </ChartCard>
      </div>

      {/* Full comparison matrix */}
      <Card className="card-gradient p-5">
        <h3 className="mb-4 font-semibold">Branch Comparison Matrix</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Customers</TableHead>
              <TableHead>AOV</TableHead>
              <TableHead>Growth</TableHead>
              <TableHead>Best Product</TableHead>
              <TableHead>Top Category</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((s) => (
              <TableRow key={s.branch}>
                <TableCell className="font-semibold">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: BRANCH_COLORS[s.branch] }} />
                    {s.branch}
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">{fmtCurrencyFull(s.revenue)}</TableCell>
                <TableCell className="tabular-nums text-brand-success">{fmtCurrencyFull(s.profit)}</TableCell>
                <TableCell className="tabular-nums">{fmtPercent(s.margin)}</TableCell>
                <TableCell className="tabular-nums">{fmtNumberFull(s.orders)}</TableCell>
                <TableCell className="tabular-nums">{fmtNumberFull(s.customers)}</TableCell>
                <TableCell className="tabular-nums">{fmtCurrencyFull(s.orders ? s.revenue / s.orders : 0)}</TableCell>
                <TableCell className="tabular-nums">
                  <Badge variant={s.growth >= 0 ? "success" : "danger"} className="h-5">{fmtSigned(s.growth)}</Badge>
                </TableCell>
                <TableCell>{s.bestProduct}</TableCell>
                <TableCell>{s.bestCategory}</TableCell>
                <TableCell className="font-bold tabular-nums">{s.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
