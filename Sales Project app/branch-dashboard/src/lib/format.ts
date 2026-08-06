const egpCompact = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  notation: "compact",
  maximumFractionDigits: 1,
});

const egpFull = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

const numCompact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const numFull = new Intl.NumberFormat("en-US");

/** Compact currency, e.g. EGP 1.2M — used on KPI cards & charts. */
export function fmtCurrency(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return egpCompact.format(v).replace("EGP", "EGP ").replace("  ", " ");
}

/** Full currency, e.g. EGP 1,234,567 — used in tables & tooltips. */
export function fmtCurrencyFull(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return egpFull.format(v);
}

export function fmtNumber(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return numCompact.format(v);
}

export function fmtNumberFull(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return numFull.format(v);
}

/** Accepts a fraction (0.24) and renders 24.0%. */
export function fmtPercent(fraction: number, digits = 1): string {
  if (!Number.isFinite(fraction)) return "—";
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** Accepts an already-scaled percentage value (24) and renders +24.0%. */
export function fmtSigned(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}
