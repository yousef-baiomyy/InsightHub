"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, Legend,
} from "recharts";
import type { SaleRecord } from "@/types";
import { CHART_PALETTE, groupBy } from "@/lib/metrics";
import { fmtCurrency, fmtCurrencyFull } from "@/lib/format";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

const axis = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const grid = "hsl(var(--border))";

function RankedBar({ data, color, height }: { data: { name: string; revenue: number }[]; color: string; height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 2, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
        <XAxis type="number" tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCurrency(Number(v))} />
        <YAxis type="category" dataKey="name" tick={axis} axisLine={false} tickLine={false} width={130} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
        <Bar dataKey="revenue" name="Revenue" fill={color} radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopProducts({ records, n = 10, height = 340 }: { records: SaleRecord[]; n?: number; height?: number }) {
  const data = groupBy(records, "product").slice(0, n).reverse().map((g) => ({ name: g.key, revenue: g.revenue }));
  return <RankedBar data={data} color="#2563EB" height={height} />;
}

export function BottomProducts({ records, n = 10, height = 340 }: { records: SaleRecord[]; n?: number; height?: number }) {
  const all = groupBy(records, "product");
  const data = all.slice(-n).map((g) => ({ name: g.key, revenue: g.revenue }));
  return <RankedBar data={data} color="#EF4444" height={height} />;
}

export function TopCustomers({ records, n = 10, height = 340 }: { records: SaleRecord[]; n?: number; height?: number }) {
  const data = groupBy(records, "customer").slice(0, n).reverse().map((g) => ({ name: g.key, revenue: g.revenue }));
  return <RankedBar data={data} color="#7C3AED" height={height} />;
}

export function SegmentPie({ records, field = "segment", height = 300 }: { records: SaleRecord[]; field?: "segment" | "channel" | "paymentMethod"; height?: number }) {
  const data = groupBy(records, field).map((g) => ({ name: g.key, value: g.revenue }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={0} outerRadius={100} paddingAngle={2} stroke="hsl(var(--card))" strokeWidth={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PaymentDonut({ records, height = 300 }: { records: SaleRecord[]; height?: number }) {
  const data = groupBy(records, "paymentMethod").map((g) => ({ name: g.key, value: g.revenue }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Bubble/scatter: quantity (x) vs profit (y), bubble size = revenue. */
export function QuantityProfitScatter({ records, height = 320 }: { records: SaleRecord[]; height?: number }) {
  const data = records.slice(0, 500).map((r) => ({ x: r.quantity, y: r.profit, z: r.revenue, name: r.product }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis type="number" dataKey="x" name="Quantity" tick={axis} axisLine={false} tickLine={false} />
        <YAxis type="number" dataKey="y" name="Profit" tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCurrency(Number(v))} width={64} />
        <ZAxis type="number" dataKey="z" range={[30, 400]} name="Revenue" />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value: number, name: string) => [name === "Profit" || name === "Revenue" ? fmtCurrencyFull(value) : value, name]}
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }}
        />
        <Scatter data={data} fill="#06B6D4" fillOpacity={0.55} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
