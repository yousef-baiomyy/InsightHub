"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, Treemap,
  XAxis, YAxis, Legend,
} from "recharts";
import type { SaleRecord } from "@/types";
import { CHART_PALETTE, groupBy } from "@/lib/metrics";
import { fmtCurrency, fmtCurrencyFull } from "@/lib/format";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

const axis = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const grid = "hsl(var(--border))";

export function CategoryBar({ records, height = 300 }: { records: SaleRecord[]; height?: number }) {
  const data = groupBy(records, "category").map((g) => ({ name: g.key, revenue: g.revenue, profit: g.profit }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
        <XAxis type="number" tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCurrency(Number(v))} />
        <YAxis type="category" dataKey="name" tick={axis} axisLine={false} tickLine={false} width={110} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
        <Bar dataKey="revenue" name="Revenue" radius={[0, 8, 8, 0]} barSize={26}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TreemapNode { name: string; size: number; fill: string }

function TreemapContent(props: {
  x?: number; y?: number; width?: number; height?: number; name?: string; fill?: string;
}) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", fill = "#2563EB" } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} style={{ fill, stroke: "hsl(var(--card))", strokeWidth: 3 }} />
      {width > 70 && height > 34 && (
        <text x={x + 10} y={y + 22} fill="#fff" fontSize={12} fontWeight={600}>{name}</text>
      )}
    </g>
  );
}

export function CategoryTreemap({ records, height = 300 }: { records: SaleRecord[]; height?: number }) {
  const data: TreemapNode[] = groupBy(records, "product")
    .slice(0, 12)
    .map((g, i) => ({ name: g.key, size: g.revenue, fill: CHART_PALETTE[i % CHART_PALETTE.length] }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap data={data} dataKey="size" nameKey="name" content={<TreemapContent />} isAnimationActive>
        <Tooltip
          formatter={(value: number) => [fmtCurrencyFull(value), "Revenue"]}
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}

/** Stacked revenue: category × branch (the "sub-category" view uses Product below). */
export function CategoryStackedByBranch({ records, height = 300 }: { records: SaleRecord[]; height?: number }) {
  const cats = Array.from(new Set(records.map((r) => r.category)));
  const branches = Array.from(new Set(records.map((r) => r.branch)));
  const data = cats.map((cat) => {
    const row: Record<string, number | string> = { category: cat };
    for (const b of branches) {
      row[b] = records.filter((r) => r.category === cat && r.branch === b).reduce((a, r) => a + r.revenue, 0);
    }
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="category" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCurrency(Number(v))} width={64} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
        <Legend />
        {branches.map((b, i) => (
          <Bar key={b} dataKey={b} name={b} stackId="s" fill={CHART_PALETTE[i % CHART_PALETTE.length]} radius={i === branches.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
