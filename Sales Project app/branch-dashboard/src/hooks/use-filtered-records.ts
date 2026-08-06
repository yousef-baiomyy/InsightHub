"use client";

import { useMemo } from "react";
import type { Branch, SaleRecord } from "@/types";
import { useData } from "@/components/providers/data-provider";
import { useFilters } from "@/stores/filters";
import { useAuth } from "@/stores/auth";
import { isManager } from "@/lib/auth";

/**
 * Single source of truth for "the data the current view should see".
 * Branch managers are hard-scoped to their branch BEFORE any UI filter runs,
 * so other branches' rows never enter their dataset — even via URL tampering.
 */
export function useFilteredRecords(): { records: SaleRecord[]; scopedBranch: Branch | null } {
  const { records } = useData();
  const f = useFilters();
  const user = useAuth((s) => s.user);

  const scopedBranch = user && !isManager(user) ? (user.branch as Branch) : null;

  const filtered = useMemo(() => {
    let rows = records;

    // 1) Role scoping (non-negotiable, applied first)
    if (scopedBranch) rows = rows.filter((r) => r.branch === scopedBranch);

    // 2) Branch filter (manager only — the panel hides it for branch users)
    if (f.branches.length) rows = rows.filter((r) => f.branches.includes(r.branch));

    // 3) Categorical filters
    if (f.categories.length) rows = rows.filter((r) => f.categories.includes(r.category));
    if (f.products.length) rows = rows.filter((r) => f.products.includes(r.product));
    if (f.paymentMethods.length) rows = rows.filter((r) => f.paymentMethods.includes(r.paymentMethod));
    if (f.segments.length) rows = rows.filter((r) => f.segments.includes(r.segment));
    if (f.channels.length) rows = rows.filter((r) => f.channels.includes(r.channel));
    if (f.statuses.length) rows = rows.filter((r) => f.statuses.includes(r.status));
    if (f.salespeople.length) rows = rows.filter((r) => f.salespeople.includes(r.salesperson));
    if (f.months.length) rows = rows.filter((r) => f.months.includes(r.monthKey));
    if (f.quarters.length) rows = rows.filter((r) => f.quarters.includes(r.quarter));

    // 4) Date range
    if (f.dateFrom) rows = rows.filter((r) => r.orderDate >= f.dateFrom!);
    if (f.dateTo) rows = rows.filter((r) => r.orderDate <= f.dateTo!);

    // 5) Price range (unit price)
    if (f.priceMin !== null) rows = rows.filter((r) => r.unitPrice >= f.priceMin!);
    if (f.priceMax !== null) rows = rows.filter((r) => r.unitPrice <= f.priceMax!);

    // 6) Global text search
    const q = f.search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        r.customer.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.branch.toLowerCase().includes(q) ||
        r.salesperson.toLowerCase().includes(q),
      );
    }

    return rows;
  }, [records, scopedBranch, f]);

  return { records: filtered, scopedBranch };
}

/** Options for filter dropdowns, respecting the user's branch scope. */
export function useScopedRecords(): SaleRecord[] {
  const { records } = useData();
  const user = useAuth((s) => s.user);
  const scopedBranch = user && !isManager(user) ? (user.branch as Branch) : null;
  return useMemo(
    () => (scopedBranch ? records.filter((r) => r.branch === scopedBranch) : records),
    [records, scopedBranch],
  );
}
