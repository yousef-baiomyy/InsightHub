"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, RefreshCw, LogOut, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useData } from "@/components/providers/data-provider";
import { useAuth } from "@/stores/auth";
import { isManager } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { reload, records, loading } = useData();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const themes = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <Card className="card-gradient p-6">
        <h3 className="font-semibold">Account</h3>
        <p className="mb-4 text-sm text-muted-foreground">Signed-in session details.</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="mt-0.5 font-medium">{user?.displayName}</p>
          </div>
          <div className="rounded-xl border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="mt-0.5">
              <Badge variant={isManager(user) ? "secondary" : "default"}>
                {isManager(user) ? "Manager · all branches" : `${user?.branch} branch`}
              </Badge>
            </p>
          </div>
        </div>
      </Card>

      <Card className="card-gradient p-6">
        <h3 className="font-semibold">Appearance</h3>
        <p className="mb-4 text-sm text-muted-foreground">Choose your preferred theme.</p>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((t) => {
            const Icon = t.icon;
            const active = mounted && theme === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
                  active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="card-gradient p-6">
        <h3 className="font-semibold">Data Source</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {loading ? "Loading…" : `${records.length.toLocaleString()} rows loaded from 3 Excel files in /public/data.`}
        </p>
        <Button variant="outline" onClick={reload} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Reload data
        </Button>
      </Card>

      <Card className="border-primary/30 bg-primary/5 p-6">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold">Demo authentication notice</p>
            <p className="mt-1 text-muted-foreground">
              Credentials are stored client-side for demo purposes only and provide no real security.
              For production, move authentication behind a backend or an identity provider.
            </p>
          </div>
        </div>
      </Card>

      <Button
        variant="destructive"
        onClick={() => {
          logout();
          router.replace("/login");
        }}
      >
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}
