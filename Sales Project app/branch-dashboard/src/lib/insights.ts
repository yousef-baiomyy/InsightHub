import type { SaleRecord } from "@/types";
import { branchStats, computeKpis, groupBy, monthlySeries } from "@/lib/metrics";
import { fmtCurrency, fmtPercent, fmtSigned } from "@/lib/format";

export type InsightTone = "positive" | "negative" | "neutral" | "highlight";

export interface Insight {
  id: string;
  title: string;
  detail: string;
  tone: InsightTone;
  icon: "trend-up" | "trend-down" | "trophy" | "target" | "alert" | "sparkles";
}

/**
 * Generate business insights dynamically from the (filtered) data.
 * Rule-based — deterministic, explainable, and always grounded in the numbers.
 */
export function generateInsights(records: SaleRecord[]): Insight[] {
  const out: Insight[] = [];
  if (records.length === 0) return out;

  const kpis = computeKpis(records);
  const stats = branchStats(records);
  const categories = groupBy(records, "category");
  const products = groupBy(records, "product");
  const customers = groupBy(records, "customer");
  const series = monthlySeries(records);

  // 1. Top branch by revenue (only meaningful with >1 branch)
  if (stats.length > 1) {
    const top = stats.slice().sort((a, b) => b.revenue - a.revenue)[0];
    const share = kpis.totalRevenue ? top.revenue / kpis.totalRevenue : 0;
    out.push({
      id: "top-branch",
      title: `${top.branch} leads on revenue`,
      detail: `${top.branch} generated ${fmtCurrency(top.revenue)} — ${fmtPercent(share)} of the total across branches.`,
      tone: "highlight",
      icon: "trophy",
    });

    // 2. Fastest growing branch
    const fastest = stats.slice().sort((a, b) => b.growth - a.growth)[0];
    out.push({
      id: "fastest-branch",
      title: `${fastest.branch} is the fastest growing`,
      detail: `Month-over-month revenue moved ${fmtSigned(fastest.growth)} in the latest period.`,
      tone: fastest.growth >= 0 ? "positive" : "negative",
      icon: fastest.growth >= 0 ? "trend-up" : "trend-down",
    });

    // 3. Most profitable branch by margin
    const mostProfitable = stats.slice().sort((a, b) => b.margin - a.margin)[0];
    out.push({
      id: "margin-branch",
      title: `${mostProfitable.branch} runs the healthiest margin`,
      detail: `Profit margin of ${fmtPercent(mostProfitable.margin)} — the strongest of the branches in view.`,
      tone: "positive",
      icon: "target",
    });
  }

  // 4. Overall sales growth trend
  if (series.length >= 2) {
    out.push({
      id: "growth",
      title: kpis.salesGrowth >= 0 ? "Sales are trending up" : "Sales dipped last month",
      detail: `Revenue changed ${fmtSigned(kpis.salesGrowth)} vs. the previous month in the current selection.`,
      tone: kpis.salesGrowth >= 0 ? "positive" : "negative",
      icon: kpis.salesGrowth >= 0 ? "trend-up" : "trend-down",
    });
  }

  // 5. Category concentration
  if (categories.length > 0 && kpis.totalRevenue) {
    const top = categories[0];
    out.push({
      id: "top-category",
      title: `${top.key} drives the category mix`,
      detail: `${top.key} is responsible for ${fmtPercent(top.revenue / kpis.totalRevenue)} of revenue in view.`,
      tone: "neutral",
      icon: "sparkles",
    });
  }

  // 6. Product contribution
  if (products.length > 0 && kpis.totalRevenue) {
    const top = products[0];
    out.push({
      id: "top-product",
      title: `${top.key} is the top product`,
      detail: `${top.key} contributes ${fmtPercent(top.revenue / kpis.totalRevenue)} of total sales (${fmtCurrency(top.revenue)}).`,
      tone: "highlight",
      icon: "trophy",
    });

    // Weakest product flag
    const worst = products[products.length - 1];
    if (products.length > 3) {
      out.push({
        id: "weak-product",
        title: `${worst.key} is underperforming`,
        detail: `${worst.key} brought in only ${fmtCurrency(worst.revenue)} — the lowest in the current view.`,
        tone: "negative",
        icon: "alert",
      });
    }
  }

  // 7. Customer concentration
  if (customers.length > 0 && kpis.totalRevenue) {
    const top5 = customers.slice(0, 5);
    const share = top5.reduce((a, c) => a + c.revenue, 0) / kpis.totalRevenue;
    out.push({
      id: "customer-concentration",
      title: "Top 5 customers concentration",
      detail: `Your 5 largest customers account for ${fmtPercent(share)} of revenue in the current selection.`,
      tone: share > 0.4 ? "negative" : "neutral",
      icon: share > 0.4 ? "alert" : "sparkles",
    });
  }

  // 8. Returns / cancellations exposure
  const badRows = records.filter((r) => r.status === "Returned" || r.status === "Cancelled");
  if (badRows.length > 0) {
    const badRev = badRows.reduce((a, r) => a + r.revenue, 0);
    const share = kpis.totalRevenue ? badRev / kpis.totalRevenue : 0;
    out.push({
      id: "returns",
      title: "Returns & cancellations exposure",
      detail: `${fmtPercent(share)} of revenue in view sits on returned or cancelled orders (${fmtCurrency(badRev)}).`,
      tone: share > 0.2 ? "negative" : "neutral",
      icon: "alert",
    });
  }

  return out;
}
