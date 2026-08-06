"use client";

import { format } from "date-fns";
import type { SaleRecord } from "@/types";
import { fmtCurrencyFull } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  Completed: "success",
  Returned: "warning",
  Cancelled: "danger",
};

export function RecentTransactions({ records, limit = 8 }: { records: SaleRecord[]; limit?: number }) {
  const rows = [...records].sort((a, b) => b.orderDate.localeCompare(a.orderDate)).slice(0, limit);

  if (rows.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">No transactions.</p>;

  return (
    <div className="space-y-1">
      {rows.map((r) => (
        <div key={r.orderId} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/50">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-accent text-xs font-bold text-white">
            {r.customer.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{r.customer}</p>
            <p className="truncate text-xs text-muted-foreground">
              {r.product} · {r.branch} · {format(new Date(r.orderDate), "dd MMM")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums">{fmtCurrencyFull(r.revenue)}</p>
            <Badge variant={STATUS_VARIANT[r.status] ?? "default"} className="mt-0.5 h-4 px-1.5 text-[10px]">
              {r.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
