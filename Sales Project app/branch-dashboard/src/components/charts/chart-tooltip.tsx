"use client";

import type { TooltipProps } from "recharts";
import { fmtCurrencyFull, fmtNumberFull } from "@/lib/format";

function isCurrencyKey(name: string): boolean {
  const k = name.toLowerCase();
  return k.includes("revenue") || k.includes("profit") || k.includes("sales") || k.includes("value") || k.includes("egp");
}

export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label !== undefined && <p className="mb-1 font-semibold">{String(label)}</p>}
      <div className="space-y-0.5">
        {payload.map((entry, i) => {
          const name = String(entry.name ?? "");
          const value = Number(entry.value ?? 0);
          return (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                {name}
              </span>
              <span className="font-medium tabular-nums">
                {isCurrencyKey(name) ? fmtCurrencyFull(value) : fmtNumberFull(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
