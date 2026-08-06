"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/providers/auth-guard";
import { DataProvider } from "@/components/providers/data-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <DataProvider>
        <div className="min-h-screen bg-background">
          <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
          <div className="lg:pl-72">
            <Topbar pathname={pathname} onMenu={() => setMenuOpen(true)} />
            <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">{children}</main>
          </div>
        </div>
      </DataProvider>
    </AuthGuard>
  );
}
