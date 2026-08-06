"use client";

import {
  Area, AreaChart, Bar, CartesianGrid, ComposedChart, Line, LineChart,
  ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";
import type { SaleRecord } from "@/types";
import { dailySeries, monthlySeries } from "@/lib/metrics";
import { fmtCurrency } from "@/lib/format";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

const axis = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const grid = "hsl(var(--border))";

export function RevenueTrend({ records, height = 300 }: { records: SaleRecord[]; height?: number }) {
  const data = monthlySeries(records);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCurrency(Number(v))} width={64} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueVsProfit({ records, height = 300 }: { records: SaleRecord[]; height?: number }) {
  const data = monthlySeries(records);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCurrency(Number(v))} width={64} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={22} />
        <Line type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function DailySales({ records, height = 260 }: { records: SaleRecord[]; height?: number }) {
  const data = dailySeries(records);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="date" tick={axis} axisLine={false} tickLine={false} minTickGap={40} tickFormatter={(v) => String(v).slice(5)} />
        <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCurrency(Number(v))} width={64} />
        <Tooltip content={<ChartTooltip />} />
        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#06B6D4" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
