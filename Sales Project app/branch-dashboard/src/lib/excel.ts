import * as XLSX from "xlsx";
import type { Branch, SaleRecord } from "@/types";

/** Files shipped in /public/data — the app's data source (no DB). */
const SOURCES: { file: string; branch: Branch }[] = [
  { file: "/data/cairo.xlsx", branch: "Cairo" },
  { file: "/data/alexandria.xlsx", branch: "Alexandria" },
  { file: "/data/mansoura.xlsx", branch: "Mansoura" },
];

type RawRow = Record<string, unknown>;

function num(v: unknown, fallback = 0): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown, fallback = "—"): string {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s === "" ? fallback : s;
}

/** Normalize an Excel serial or Date/string into an ISO yyyy-mm-dd string. */
function toIsoDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    // Excel serial date -> JS date
    const parsed = XLSX.SSF?.parse_date_code?.(v);
    if (parsed) {
      const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
      return d.toISOString().slice(0, 10);
    }
  }
  const d = new Date(String(v));
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return "1970-01-01";
}

/** Column-name resolver: tolerant to spacing / (EGP) / % suffixes. */
function pick(row: RawRow, ...candidates: string[]): unknown {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const hit = keys.find((k) => k.toLowerCase().replace(/\s+/g, " ").trim() === cand.toLowerCase());
    if (hit !== undefined) return row[hit];
  }
  // loose contains match as a last resort
  for (const cand of candidates) {
    const hit = keys.find((k) => k.toLowerCase().includes(cand.toLowerCase()));
    if (hit !== undefined) return row[hit];
  }
  return undefined;
}

function normalizeRow(row: RawRow, branch: Branch): SaleRecord | null {
  const orderId = str(pick(row, "Order ID"), "");
  if (!orderId) return null; // skip empty rows gracefully

  const iso = toIsoDate(pick(row, "Order Date", "Date"));
  const d = new Date(iso);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const quarter = Math.floor((month - 1) / 3) + 1;

  const revenue = num(pick(row, "Net Sales (EGP)", "Net Sales", "Revenue"));
  const profit = num(pick(row, "Profit (EGP)", "Profit"));

  return {
    orderId,
    orderDate: iso,
    // Trust the file->branch mapping over any stray value in the sheet.
    branch,
    city: str(pick(row, "City / Area", "City")),
    salesperson: str(pick(row, "Salesperson", "Sales Person")),
    customer: str(pick(row, "Customer Name", "Customer")),
    segment: str(pick(row, "Customer Segment", "Segment")),
    channel: str(pick(row, "Sales Channel", "Channel")),
    category: str(pick(row, "Product Category", "Category")),
    product: str(pick(row, "Product")),
    quantity: num(pick(row, "Quantity")),
    unitPrice: num(pick(row, "Unit Price (EGP)", "Unit Price")),
    discount: num(pick(row, "Discount %", "Discount")),
    grossSales: num(pick(row, "Gross Sales (EGP)", "Gross Sales")),
    revenue,
    unitCost: num(pick(row, "Unit Cost (EGP)", "Unit Cost")),
    totalCost: num(pick(row, "Total Cost (EGP)", "Total Cost")),
    profit,
    profitMargin: num(pick(row, "Profit Margin %", "Profit Margin"), revenue ? profit / revenue : 0),
    paymentMethod: str(pick(row, "Payment Method")),
    status: str(pick(row, "Order Status", "Status")),
    rating: num(pick(row, "Customer Rating", "Rating")),
    year,
    month,
    monthKey,
    quarter,
  };
}

async function parseFile(url: string, branch: Branch): Promise<SaleRecord[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Missing data file: ${url} (${res.status})`);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error(`Empty workbook: ${url}`);
  const rows = XLSX.utils.sheet_to_json<RawRow>(wb.Sheets[sheetName], { defval: "" });
  const records: SaleRecord[] = [];
  for (const r of rows) {
    const rec = normalizeRow(r, branch);
    if (rec) records.push(rec);
  }
  if (records.length === 0) throw new Error(`No valid rows parsed in ${url}`);
  return records;
}

/** Load, merge and normalize all three branch files into one master dataset. */
export async function loadAllSales(): Promise<SaleRecord[]> {
  const chunks = await Promise.all(SOURCES.map((s) => parseFile(s.file, s.branch)));
  return chunks.flat();
}
