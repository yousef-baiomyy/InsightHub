import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uniqueSorted(values: (string | number)[]): string[] {
  return Array.from(new Set(values.map(String))).sort((a, b) => a.localeCompare(b));
}
