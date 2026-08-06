import { create } from "zustand";
import type { Branch, FilterState } from "@/types";

const EMPTY: FilterState = {
  branches: [],
  categories: [],
  products: [],
  paymentMethods: [],
  segments: [],
  channels: [],
  statuses: [],
  salespeople: [],
  months: [],
  quarters: [],
  dateFrom: null,
  dateTo: null,
  priceMin: null,
  priceMax: null,
  search: "",
};

interface FilterStore extends FilterState {
  set: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  toggleIn: (key: "branches" | "categories" | "products" | "paymentMethods" | "segments" | "channels" | "statuses" | "salespeople" | "months", value: string) => void;
  toggleQuarter: (q: number) => void;
  reset: () => void;
  activeCount: () => number;
}

export const useFilters = create<FilterStore>((set, get) => ({
  ...EMPTY,
  set: (key, value) => set({ [key]: value } as Partial<FilterState>),
  toggleIn: (key, value) =>
    set((s) => {
      const arr = s[key] as string[];
      return { [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] } as Partial<FilterState>;
    }),
  toggleQuarter: (q) =>
    set((s) => ({ quarters: s.quarters.includes(q) ? s.quarters.filter((x) => x !== q) : [...s.quarters, q] })),
  reset: () => set({ ...EMPTY }),
  activeCount: () => {
    const s = get();
    let n = 0;
    (["branches", "categories", "products", "paymentMethods", "segments", "channels", "statuses", "salespeople", "months", "quarters"] as const).forEach(
      (k) => { if ((s[k] as unknown[]).length) n += 1; },
    );
    if (s.dateFrom || s.dateTo) n += 1;
    if (s.priceMin !== null || s.priceMax !== null) n += 1;
    if (s.search.trim()) n += 1;
    return n;
  },
}));

export type { Branch };
