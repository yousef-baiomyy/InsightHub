"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, ShoppingCart, Users, Package,
  Target, Percent, Trophy, Calendar, Boxes, type LucideIcon,
} from "lucide-react";
import type { Kpis } from "@/types";
import { cn } from "@/lib/utils";
import { fmtCurrency, fmtNumber, fmtPercent, fmtSigned } from "@/lib/format";
import { Card } from "@/components/ui/card";

interface KpiDef {
  key: string;
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  delta?: number;
  hint?: string;
}

function KpiCard({ def, index }: { def: KpiDef; index: number }) {
  const Icon = def.icon;
  const up = (def.delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Card className="card-gradient group relative overflow-hidden p-4 transition-shadow hover:shadow-glow">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20" style={{ background: def.accent }} />
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium text-muted-foreground">{def.label}</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${def.accent}1a`, color: def.accent }}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{def.value}</p>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {def.delta !== undefined ? (
            <span className={cn("flex items-center gap-0.5 font-medium", up ? "text-brand-success" : "text-destructive")}>
              {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {fmtSigned(def.delta)}
            </span>
          ) : null}
          {def.hint && <span className="truncate text-muted-foreground">{def.hint}</span>}
        </div>
      </Card>
    </motion.div>
  );
}

export function KpiGrid({ kpis }: { kpis: Kpis }) {
  const defs: KpiDef[] = [
    { key: "rev", label: "Total Revenue", value: fmtCurrency(kpis.totalRevenue), icon: DollarSign, accent: "#2563EB", delta: kpis.salesGrowth },
    { key: "profit", label: "Total Profit", value: fmtCurrency(kpis.totalProfit), icon: Wallet, accent: "#10B981", hint: `${fmtPercent(kpis.profitMargin)} margin` },
    { key: "orders", label: "Total Orders", value: fmtNumber(kpis.totalOrders), icon: ShoppingCart, accent: "#7C3AED" },
    { key: "customers", label: "Total Customers", value: fmtNumber(kpis.totalCustomers), icon: Users, accent: "#06B6D4" },
    { key: "aov", label: "Avg Order Value", value: fmtCurrency(kpis.avgOrderValue), icon: Target, accent: "#F59E0B" },
    { key: "avgprofit", label: "Avg Profit / Order", value: fmtCurrency(kpis.avgProfit), icon: Percent, accent: "#0EA5E9" },
    { key: "margin", label: "Profit Margin", value: fmtPercent(kpis.profitMargin), icon: Percent, accent: "#10B981" },
    { key: "growth", label: "Sales Growth (MoM)", value: fmtSigned(kpis.salesGrowth), icon: TrendingUp, accent: kpis.salesGrowth >= 0 ? "#10B981" : "#EF4444" },
    { key: "qty", label: "Total Quantity", value: fmtNumber(kpis.totalQuantity), icon: Boxes, accent: "#8B5CF6" },
    { key: "best", label: "Best Product", value: kpis.bestProduct, icon: Trophy, accent: "#F59E0B" },
    { key: "bestcat", label: "Best Category", value: kpis.bestCategory, icon: Package, accent: "#2563EB" },
    { key: "worst", label: "Worst Product", value: kpis.worstProduct, icon: TrendingDown, accent: "#EF4444" },
    { key: "mrev", label: "Latest Month Revenue", value: fmtCurrency(kpis.monthlyRevenue), icon: Calendar, accent: "#06B6D4" },
    { key: "mprofit", label: "Latest Month Profit", value: fmtCurrency(kpis.monthlyProfit), icon: Calendar, accent: "#10B981" },
    { key: "ytd", label: "Year-to-Date Revenue", value: fmtCurrency(kpis.ytdRevenue), icon: DollarSign, accent: "#7C3AED" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {defs.map((d, i) => (
        <KpiCard key={d.key} def={d} index={i} />
      ))}
    </div>
  );
}

/** Compact 4-KPI strip for branch/sub pages. */
export function KpiStrip({ kpis }: { kpis: Kpis }) {
  const defs: KpiDef[] = [
    { key: "rev", label: "Revenue", value: fmtCurrency(kpis.totalRevenue), icon: DollarSign, accent: "#2563EB", delta: kpis.salesGrowth },
    { key: "profit", label: "Profit", value: fmtCurrency(kpis.totalProfit), icon: Wallet, accent: "#10B981", hint: `${fmtPercent(kpis.profitMargin)} margin` },
    { key: "orders", label: "Orders", value: fmtNumber(kpis.totalOrders), icon: ShoppingCart, accent: "#7C3AED" },
    { key: "customers", label: "Customers", value: fmtNumber(kpis.totalCustomers), icon: Users, accent: "#06B6D4" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {defs.map((d, i) => (
        <KpiCard key={d.key} def={d} index={i} />
      ))}
    </div>
  );
}
