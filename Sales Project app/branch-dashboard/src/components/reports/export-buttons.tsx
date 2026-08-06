"use client";

import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import type { Kpis, SaleRecord } from "@/types";
import { exportExcel, exportPdf } from "@/lib/export";
import { Button } from "@/components/ui/button";

export function ExportButtons({ records, kpis, size = "sm" }: { records: SaleRecord[]; kpis: Kpis; size?: "sm" | "default" }) {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button variant="outline" size={size} onClick={() => exportPdf(records, kpis)}>
        <FileDown className="h-4 w-4" /> Export PDF
      </Button>
      <Button variant="outline" size={size} onClick={() => exportExcel(records)}>
        <FileSpreadsheet className="h-4 w-4" /> Export Excel
      </Button>
      <Button variant="subtle" size={size} onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print
      </Button>
    </div>
  );
}
