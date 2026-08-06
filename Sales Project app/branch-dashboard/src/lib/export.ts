import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Kpis, SaleRecord } from "@/types";
import { fmtCurrencyFull, fmtPercent } from "@/lib/format";

const HEADERS = [
  "Order ID", "Date", "Branch", "City", "Salesperson", "Customer", "Segment",
  "Channel", "Category", "Product", "Qty", "Unit Price", "Discount %",
  "Revenue", "Profit", "Margin %", "Payment", "Status", "Rating",
];

function toRow(r: SaleRecord): (string | number)[] {
  return [
    r.orderId, r.orderDate, r.branch, r.city, r.salesperson, r.customer, r.segment,
    r.channel, r.category, r.product, r.quantity, r.unitPrice, +(r.discount * 100).toFixed(1),
    r.revenue, r.profit, +(r.profitMargin * 100).toFixed(1), r.paymentMethod, r.status, r.rating,
  ];
}

/** Export the current (filtered) records to a formatted .xlsx workbook. */
export function exportExcel(records: SaleRecord[], fileName = "branch-sales-export.xlsx") {
  const aoa = [HEADERS, ...records.map(toRow)];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = HEADERS.map((h) => ({ wch: Math.max(10, h.length + 2) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sales");
  XLSX.writeFile(wb, fileName);
}

/** Export an executive PDF: KPI summary + a sample of transactions. */
export function exportPdf(records: SaleRecord[], kpis: Kpis, title = "Branch Sales Report", fileName = "branch-sales-report.pdf") {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(title, 40, 30);
  doc.setFontSize(10);
  doc.text(new Date().toLocaleString(), 40, 48);

  doc.setTextColor(30, 41, 59);
  const summary: [string, string][] = [
    ["Total Revenue", fmtCurrencyFull(kpis.totalRevenue)],
    ["Total Profit", fmtCurrencyFull(kpis.totalProfit)],
    ["Profit Margin", fmtPercent(kpis.profitMargin)],
    ["Total Orders", String(kpis.totalOrders)],
    ["Total Customers", String(kpis.totalCustomers)],
    ["Avg Order Value", fmtCurrencyFull(kpis.avgOrderValue)],
    ["Best Product", kpis.bestProduct],
    ["Best Category", kpis.bestCategory],
  ];

  autoTable(doc, {
    startY: 76,
    head: [["Metric", "Value"]],
    body: summary,
    theme: "grid",
    headStyles: { fillColor: [124, 58, 237] },
    styles: { fontSize: 9 },
    tableWidth: 300,
  });

  const sample = records.slice(0, 60).map((r) => [
    r.orderId, r.orderDate, r.branch, r.customer, r.product, fmtCurrencyFull(r.revenue), fmtCurrencyFull(r.profit), r.status,
  ]);

  autoTable(doc, {
    startY: 76,
    margin: { left: 360 },
    head: [["Order", "Date", "Branch", "Customer", "Product", "Revenue", "Profit", "Status"]],
    body: sample,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 7 },
  });

  doc.save(fileName);
}
