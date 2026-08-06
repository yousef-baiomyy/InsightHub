"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { canAccessPath } from "@/lib/auth";

/**
 * Guards the dashboard shell:
 *  - unauthenticated users -> /login
 *  - branch managers hitting a manager-only path (even via manual URL) -> /dashboard
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!canAccessPath(user, pathname)) {
      router.replace("/dashboard");
    }
  }, [hydrated, user, pathname, router]);

  if (!hydrated || !user || !canAccessPath(user, pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
