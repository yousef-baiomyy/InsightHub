export type Branch = "Cairo" | "Alexandria" | "Mansoura";

export type Role = "manager" | "cairo" | "alex" | "mansoura";

/** A single normalized sale record (one order line). */
export interface SaleRecord {
  orderId: string;
  orderDate: string; // ISO yyyy-mm-dd
  branch: Branch;
  city: string;
  salesperson: string;
  customer: string;
  segment: string;
  channel: string;
  category: string;
  product: string;
  quantity: number;
  unitPrice: number;
  discount: number; // fraction 0..1
  grossSales: number;
  revenue: number; // Net Sales (EGP)
  unitCost: number;
  totalCost: number;
  profit: number;
  profitMargin: number; // fraction
  paymentMethod: string;
  status: string; // Completed | Returned | Cancelled
  rating: number; // 3..5
  // Derived helpers
  year: number;
  month: number; // 1..12
  monthKey: string; // yyyy-MM
  quarter: number; // 1..4
}

export interface FilterState {
  branches: Branch[]; // empty = all allowed
  categories: string[];
  products: string[];
  paymentMethods: string[];
  segments: string[];
  channels: string[];
  statuses: string[];
  salespeople: string[];
  months: string[]; // monthKeys
  quarters: number[];
  dateFrom: string | null;
  dateTo: string | null;
  priceMin: number | null;
  priceMax: number | null;
  search: string;
}

export interface Kpis {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  totalCustomers: number;
  totalQuantity: number;
  avgOrderValue: number;
  avgProfit: number;
  profitMargin: number;
  salesGrowth: number; // % vs previous month in range
  monthlyRevenue: number; // latest month in range
  monthlyProfit: number;
  ytdRevenue: number;
  bestProduct: string;
  bestCategory: string;
  worstProduct: string;
  avgRating: number;
}
