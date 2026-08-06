"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SaleRecord } from "@/types";
import { loadAllSales } from "@/lib/excel";

interface DataContextValue {
  records: SaleRecord[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadAllSales()
      .then((data) => {
        if (!cancelled) setRecords(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load data files.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return (
    <DataContext.Provider value={{ records, loading, error, reload: () => setTick((t) => t + 1) }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
