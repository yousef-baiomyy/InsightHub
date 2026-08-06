import type { Branch, Kpis, SaleRecord } from "@/types";

export const BRANCHES: Branch[] = ["Cairo", "Alexandria", "Mansoura"];

export const BRANCH_COLORS: Record<Branch, string> = {
  Cairo: "#2563EB",
  Alexandria: "#7C3AED",
  Mansoura: "#06B6D4",
};

export const CHART_PALETTE = [
  "#2563EB",
  "#7C3AED",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#0EA5E9",
  "#14B8A6",
  "#F97316",
];

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

export interface Group {
  key: string;
  revenue: number;
  profit: number;
  orders: number;
  quantity: number;
  customers: number;
  margin: number;
}

/** Generic group-by over any string field, sorted by revenue desc. */
export function groupBy(records: SaleRecord[], field: keyof SaleRecord): Group[] {
  const map = new Map<string, { rev: number; prof: number; orders: number; qty: number; cust: Set<string> }>();
  for (const r of records) {
    const key = String(r[field] ?? "—");
    const g = map.get(key) ?? { rev: 0, prof: 0, orders: 0, qty: 0, cust: new Set<string>() };
    g.rev += r.revenue;
    g.prof += r.profit;
    g.orders += 1;
    g.qty += r.quantity;
    g.cust.add(r.customer);
    map.set(key, g);
  }
  return Array.from(map.entries())
    .map(([key, g]) => ({
      key,
      revenue: g.rev,
      profit: g.prof,
      orders: g.orders,
      quantity: g.qty,
      customers: g.cust.size,
      margin: g.rev ? g.prof / g.rev : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface TimePoint {
  monthKey: string;
  label: string; // e.g. "Jan"
  revenue: number;
  profit: number;
  orders: number;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Monthly time series across the whole record set (sorted chronologically). */
export function monthlySeries(records: SaleRecord[]): TimePoint[] {
  const map = new Map<string, TimePoint>();
  for (const r of records) {
    const p = map.get(r.monthKey) ?? {
      monthKey: r.monthKey,
      label: MONTH_LABELS[r.month - 1] ?? r.monthKey,
      revenue: 0,
      profit: 0,
      orders: 0,
    };
    p.revenue += r.revenue;
    p.profit += r.profit;
    p.orders += 1;
    map.set(r.monthKey, p);
  }
  return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

/** Daily series — used for the granular "daily sales" chart. */
export function dailySeries(records: SaleRecord[]): { date: string; revenue: number; profit: number }[] {
  const map = new Map<string, { date: string; revenue: number; profit: number }>();
  for (const r of records) {
    const p = map.get(r.orderDate) ?? { date: r.orderDate, revenue: 0, profit: 0 };
    p.revenue += r.revenue;
    p.profit += r.profit;
    map.set(r.orderDate, p);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function quarterlySeries(records: SaleRecord[]): { key: string; revenue: number; profit: number }[] {
  const map = new Map<string, { key: string; revenue: number; profit: number }>();
  for (const r of records) {
    const key = `${r.year} Q${r.quarter}`;
    const p = map.get(key) ?? { key, revenue: 0, profit: 0 };
    p.revenue += r.revenue;
    p.profit += r.profit;
    map.set(key, p);
  }
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

/** Revenue by branch × month — feeds the heatmap. */
export function branchMonthMatrix(records: SaleRecord[]): {
  months: string[];
  rows: { branch: Branch; values: Record<string, number>; total: number }[];
} {
  const monthsSet = new Set<string>();
  const byBranch = new Map<Branch, Record<string, number>>();
  for (const r of records) {
    monthsSet.add(r.monthKey);
    const b = byBranch.get(r.branch) ?? {};
    b[r.monthKey] = (b[r.monthKey] ?? 0) + r.revenue;
    byBranch.set(r.branch, b);
  }
  const months = Array.from(monthsSet).sort();
  const rows = BRANCHES.filter((b) => byBranch.has(b)).map((branch) => {
    const values = byBranch.get(branch) ?? {};
    return { branch, values, total: sum(Object.values(values)) };
  });
  return { months, rows };
}

/** Full KPI bundle from a (already filtered) record set. */
export function computeKpis(records: SaleRecord[]): Kpis {
  if (records.length === 0) {
    return {
      totalRevenue: 0, totalProfit: 0, totalOrders: 0, totalCustomers: 0, totalQuantity: 0,
      avgOrderValue: 0, avgProfit: 0, profitMargin: 0, salesGrowth: 0, monthlyRevenue: 0,
      monthlyProfit: 0, ytdRevenue: 0, bestProduct: "—", bestCategory: "—", worstProduct: "—", avgRating: 0,
    };
  }

  const totalRevenue = sum(records.map((r) => r.revenue));
  const totalProfit = sum(records.map((r) => r.profit));
  const totalOrders = new Set(records.map((r) => r.orderId)).size;
  const totalCustomers = new Set(records.map((r) => r.customer)).size;
  const totalQuantity = sum(records.map((r) => r.quantity));
  const avgRating = sum(records.map((r) => r.rating)) / records.length;

  const series = monthlySeries(records);
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  const salesGrowth = last && prev && prev.revenue !== 0
    ? ((last.revenue - prev.revenue) / prev.revenue) * 100
    : 0;

  const latestYear = Math.max(...records.map((r) => r.year));
  const ytdRevenue = sum(records.filter((r) => r.year === latestYear).map((r) => r.revenue));

  const products = groupBy(records, "product");
  const categories = groupBy(records, "category");

  return {
    totalRevenue,
    totalProfit,
    totalOrders,
    totalCustomers,
    totalQuantity,
    avgOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
    avgProfit: totalOrders ? totalProfit / totalOrders : 0,
    profitMargin: totalRevenue ? totalProfit / totalRevenue : 0,
    salesGrowth,
    monthlyRevenue: last?.revenue ?? 0,
    monthlyProfit: last?.profit ?? 0,
    ytdRevenue,
    bestProduct: products[0]?.key ?? "—",
    bestCategory: categories[0]?.key ?? "—",
    worstProduct: products[products.length - 1]?.key ?? "—",
    avgRating,
  };
}

/** Branch-level comparison rows with a composite performance score (0..100). */
export interface BranchStat extends Group {
  branch: Branch;
  growth: number;
  score: number;
  bestProduct: string;
  bestCategory: string;
}

export function branchStats(records: SaleRecord[]): BranchStat[] {
  const stats: BranchStat[] = BRANCHES.map((branch) => {
    const rows = records.filter((r) => r.branch === branch);
    const g = groupBy(rows, "branch")[0] ?? {
      key: branch, revenue: 0, profit: 0, orders: 0, quantity: 0, customers: 0, margin: 0,
    };
    const series = monthlySeries(rows);
    const last = series[series.length - 1];
    const prev = series[series.length - 2];
    const growth = last && prev && prev.revenue ? ((last.revenue - prev.revenue) / prev.revenue) * 100 : 0;
    const bestProduct = groupBy(rows, "product")[0]?.key ?? "—";
    const bestCategory = groupBy(rows, "category")[0]?.key ?? "—";
    return { ...g, key: branch, branch, growth, score: 0, bestProduct, bestCategory };
  }).filter((s) => s.orders > 0);

  // Composite score: normalize revenue, profit, margin, growth to 0..1 and weight.
  const maxRev = Math.max(...stats.map((s) => s.revenue), 1);
  const maxProf = Math.max(...stats.map((s) => s.profit), 1);
  const maxMargin = Math.max(...stats.map((s) => s.margin), 0.0001);
  const growths = stats.map((s) => s.growth);
  const minG = Math.min(...growths, 0);
  const maxG = Math.max(...growths, 1);
  for (const s of stats) {
    const rev = s.revenue / maxRev;
    const prof = s.profit / maxProf;
    const margin = s.margin / maxMargin;
    const growth = maxG === minG ? 0.5 : (s.growth - minG) / (maxG - minG);
    s.score = Math.round((rev * 0.4 + prof * 0.3 + margin * 0.2 + growth * 0.1) * 100);
  }
  return stats.sort((a, b) => b.score - a.score);
}
