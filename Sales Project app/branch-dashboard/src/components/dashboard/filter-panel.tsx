"use client";

import { useMemo, useState } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Branch } from "@/types";
import { uniqueSorted } from "@/lib/utils";
import { useFilters } from "@/stores/filters";
import { useAuth } from "@/stores/auth";
import { isManager } from "@/lib/auth";
import { useScopedRecords } from "@/hooks/use-filtered-records";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";

export function FilterPanel() {
  const records = useScopedRecords();
  const f = useFilters();
  const user = useAuth((s) => s.user);
  const manager = isManager(user);
  const [expanded, setExpanded] = useState(false);

  const opts = useMemo(
    () => ({
      branches: uniqueSorted(records.map((r) => r.branch)),
      categories: uniqueSorted(records.map((r) => r.category)),
      products: uniqueSorted(records.map((r) => r.product)),
      payments: uniqueSorted(records.map((r) => r.paymentMethod)),
      segments: uniqueSorted(records.map((r) => r.segment)),
      channels: uniqueSorted(records.map((r) => r.channel)),
      statuses: uniqueSorted(records.map((r) => r.status)),
      salespeople: uniqueSorted(records.map((r) => r.salesperson)),
      months: uniqueSorted(records.map((r) => r.monthKey)),
    }),
    [records],
  );

  const active = f.activeCount();

  return (
    <Card className="card-gradient p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4 text-primary" />
          Filters
          {active > 0 && <Badge variant="default" className="h-5 px-1.5">{active}</Badge>}
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {manager && (
            <MultiSelect label="Branch" options={opts.branches} selected={f.branches} onToggle={(v) => f.toggleIn("branches", v as Branch)} />
          )}
          <MultiSelect label="Category" options={opts.categories} selected={f.categories} onToggle={(v) => f.toggleIn("categories", v)} />
          <MultiSelect label="Product" options={opts.products} selected={f.products} onToggle={(v) => f.toggleIn("products", v)} />
          <MultiSelect label="Payment" options={opts.payments} selected={f.paymentMethods} onToggle={(v) => f.toggleIn("paymentMethods", v)} />
          <MultiSelect label="Month" options={opts.months} selected={f.months} onToggle={(v) => f.toggleIn("months", v)} />
        </div>

        <Button variant="ghost" size="sm" onClick={() => setExpanded((e) => !e)}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          More
        </Button>
        {active > 0 && (
          <Button variant="outline" size="sm" onClick={f.reset}>
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {expanded && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 sm:grid-cols-3 lg:grid-cols-4">
          <MultiSelect label="Segment" options={opts.segments} selected={f.segments} onToggle={(v) => f.toggleIn("segments", v)} />
          <MultiSelect label="Channel" options={opts.channels} selected={f.channels} onToggle={(v) => f.toggleIn("channels", v)} />
          <MultiSelect label="Status" options={opts.statuses} selected={f.statuses} onToggle={(v) => f.toggleIn("statuses", v)} />
          <MultiSelect label="Salesperson" options={opts.salespeople} selected={f.salespeople} onToggle={(v) => f.toggleIn("salespeople", v)} />

          <div className="col-span-2 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Date from</label>
              <Input type="date" value={f.dateFrom ?? ""} onChange={(e) => f.set("dateFrom", e.target.value || null)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Date to</label>
              <Input type="date" value={f.dateTo ?? ""} onChange={(e) => f.set("dateTo", e.target.value || null)} />
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Min unit price</label>
              <Input type="number" placeholder="0" value={f.priceMin ?? ""} onChange={(e) => f.set("priceMin", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Max unit price</label>
              <Input type="number" placeholder="∞" value={f.priceMax ?? ""} onChange={(e) => f.set("priceMax", e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">Quarter</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  onClick={() => f.toggleQuarter(q)}
                  className={`h-9 flex-1 rounded-lg border text-sm font-medium transition-colors ${
                    f.quarters.includes(q) ? "gradient-primary border-transparent text-white" : "border-input hover:bg-muted"
                  }`}
                >
                  Q{q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
