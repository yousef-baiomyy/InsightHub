"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, LineChart, ShoppingCart, Users, Package, FileBarChart,
  Sparkles, Settings, LogOut, GitCompareArrows, BarChart3, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/stores/auth";
import { isManager } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, managerOnly: false },
  { href: "/analytics", label: "Analytics", icon: LineChart, managerOnly: false },
  { href: "/sales", label: "Sales", icon: ShoppingCart, managerOnly: false },
  { href: "/customers", label: "Customers", icon: Users, managerOnly: false },
  { href: "/products", label: "Products", icon: Package, managerOnly: false },
  { href: "/comparison", label: "Branch Comparison", icon: GitCompareArrows, managerOnly: true },
  { href: "/insights", label: "Insights", icon: Sparkles, managerOnly: false },
  { href: "/reports", label: "Reports", icon: FileBarChart, managerOnly: false },
  { href: "/settings", label: "Settings", icon: Settings, managerOnly: false },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const manager = isManager(user);

  const items = NAV.filter((n) => !n.managerOnly || manager);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">Branch Sales</p>
              <p className="text-xs text-muted-foreground">Intelligence</p>
            </div>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-[1.15rem] w-[1.15rem]" />
                <span className="relative z-10 truncate">{item.label}</span>
                {item.managerOnly && (
                  <Badge variant="secondary" className="relative z-10 ml-auto h-5 px-1.5 text-[10px]">Exec</Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-accent text-sm font-bold text-white">
              {user?.displayName?.charAt(0) ?? "U"}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{user?.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{manager ? "All branches" : `${user?.branch} branch`}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-[1.15rem] w-[1.15rem]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
