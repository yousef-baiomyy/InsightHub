"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import type { Branch, SaleRecord } from "@/types";
import { BRANCH_COLORS, branchMonthMatrix, groupBy } from "@/lib/metrics";
import { fmtCurrency, fmtCurrencyFull, fmtPercent } from "@/lib/format";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

const axis = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const grid = "hsl(var(--border))";

export function BranchBars({ records, metric = "revenue", height = 280 }: { records: SaleRecord[]; metric?: "revenue" | "profit" | "orders"; height?: number }) {
  const data = groupBy(records, "branch").map((g) => ({ branch: g.key, revenue: g.revenue, profit: g.profit, orders: g.orders }));
  const label = metric === "revenue" ? "Revenue" : metric === "profit" ? "Profit" : "Orders";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="branch" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => (metric === "orders" ? String(v) : fmtCurrency(Number(v)))} width={64} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
        <Bar dataKey={metric} name={label} radius={[8, 8, 0, 0]} barSize={54}>
          {data.map((d) => (
            <Cell key={d.branch} fill={BRANCH_COLORS[d.branch as Branch] ?? "#2563EB"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BranchShareDonut({ records, height = 280 }: { records: SaleRecord[]; height?: number }) {
  const groups = groupBy(records, "branch");
  const total = groups.reduce((a, g) => a + g.revenue, 0);
  const data = groups.map((g) => ({ name: g.key, value: g.revenue }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={3} stroke="none">
          {data.map((d) => (
            <Cell key={d.name} fill={BRANCH_COLORS[d.name as Branch] ?? "#2563EB"} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          formatter={(value) => {
            const g = groups.find((x) => x.key === value);
            return `${value} · ${total ? fmtPercent((g?.revenue ?? 0) / total) : "0%"}`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Custom SVG heatmap: branch (rows) × month (cols), colored by revenue. */
export function BranchMonthHeatmap({ records }: { records: SaleRecord[] }) {
  const { months, rows } = branchMonthMatrix(records);
  if (months.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">No data</p>;
  const max = Math.max(...rows.flatMap((r) => Object.values(r.values)), 1);

  const shade = (v: number) => {
    const t = v / max; // 0..1
    // interpolate from light to brand primary
    return `rgba(37, 99, 235, ${0.08 + t * 0.82})`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid" style={{ gridTemplateColumns: `96px repeat(${months.length}, minmax(0, 1fr))` }}>
          <div />
          {months.map((m) => (
            <div key={m} className="pb-2 text-center text-[10px] text-muted-foreground">{m.slice(5)}</div>
          ))}
          {rows.map((row) => (
            <div key={row.branch} className="contents">
              <div className="flex items-center pr-2 text-xs font-medium">{row.branch}</div>
              {months.map((m) => {
                const v = row.values[m] ?? 0;
                return (
                  <div key={m} className="p-0.5">
                    <div
                      className="flex aspect-square items-center justify-center rounded-md text-[9px] font-medium text-white/90 transition-transform hover:scale-105"
                      style={{ background: shade(v) }}
                      title={`${row.branch} · ${m}: ${fmtCurrencyFull(v)}`}
                    >
                      {v > max * 0.55 ? fmtCurrency(v).replace("EGP ", "") : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
