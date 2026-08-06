"use client";

import { Menu, Search } from "lucide-react";
import { useFilters } from "@/stores/filters";
import { useAuth } from "@/stores/auth";
import { isManager } from "@/lib/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";

const TITLES: Record<string, string> = {
  "/dashboard": "Executive Dashboard",
  "/analytics": "Analytics",
  "/sales": "Sales",
  "/customers": "Customers",
  "/products": "Products",
  "/comparison": "Branch Comparison",
  "/insights": "AI Insights",
  "/reports": "Reports & Export",
  "/settings": "Settings",
};

export function Topbar({ pathname, onMenu }: { pathname: string; onMenu: () => void }) {
  const search = useFilters((s) => s.search);
  const setSearch = useFilters((s) => s.set);
  const user = useAuth((s) => s.user);
  const manager = isManager(user);
  const title = TITLES[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold md:text-lg">{title}</h2>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch("search", e.target.value)}
            placeholder="Search customer, product, invoice…"
            className="h-10 w-44 rounded-lg border border-input bg-background pl-9 pr-3 text-sm shadow-sm outline-none transition-all focus:w-72 focus:ring-2 focus:ring-ring md:w-56"
          />
        </div>

        <Badge variant={manager ? "secondary" : "default"} className="hidden h-8 items-center px-3 md:flex">
          {manager ? "Manager" : `${user?.branch}`}
        </Badge>

        <ThemeToggle />
      </div>
    </header>
  );
}
