"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, useReactTable, type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { format } from "date-fns";
import type { SaleRecord } from "@/types";
import { fmtCurrencyFull, fmtPercent } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const col = createColumnHelper<SaleRecord>();

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  Completed: "success",
  Returned: "warning",
  Cancelled: "danger",
};

export function SalesTable({ records }: { records: SaleRecord[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "orderDate", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      col.accessor("orderId", { header: "Order ID", cell: (i) => <span className="font-mono text-xs">{i.getValue()}</span> }),
      col.accessor("orderDate", { header: "Date", cell: (i) => format(new Date(i.getValue()), "dd MMM yyyy") }),
      col.accessor("branch", { header: "Branch" }),
      col.accessor("customer", { header: "Customer" }),
      col.accessor("product", { header: "Product" }),
      col.accessor("category", { header: "Category" }),
      col.accessor("quantity", { header: "Qty", cell: (i) => <span className="tabular-nums">{i.getValue()}</span> }),
      col.accessor("revenue", { header: "Revenue", cell: (i) => <span className="font-medium tabular-nums">{fmtCurrencyFull(i.getValue())}</span> }),
      col.accessor("profit", { header: "Profit", cell: (i) => <span className="tabular-nums text-brand-success">{fmtCurrencyFull(i.getValue())}</span> }),
      col.accessor("profitMargin", { header: "Margin", cell: (i) => <span className="tabular-nums">{fmtPercent(i.getValue())}</span> }),
      col.accessor("paymentMethod", { header: "Payment" }),
      col.accessor("status", { header: "Status", cell: (i) => <Badge variant={STATUS_VARIANT[i.getValue()] ?? "default"} className="h-5">{i.getValue()}</Badge> }),
    ],
    [],
  );

  const table = useReactTable({
    data: records,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search table…" className="pl-9" />
        </div>
        <p className="whitespace-nowrap text-xs text-muted-foreground">{table.getFilteredRowModel().rows.length} rows</p>
      </div>

      <div className="max-h-[600px] overflow-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : (
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
