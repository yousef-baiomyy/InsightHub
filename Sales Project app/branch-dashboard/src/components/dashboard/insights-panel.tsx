"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Trophy, Target, AlertTriangle, Sparkles, type LucideIcon,
} from "lucide-react";
import type { SaleRecord } from "@/types";
import { generateInsights, type Insight, type InsightTone } from "@/lib/insights";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const ICONS: Record<Insight["icon"], LucideIcon> = {
  "trend-up": TrendingUp,
  "trend-down": TrendingDown,
  trophy: Trophy,
  target: Target,
  alert: AlertTriangle,
  sparkles: Sparkles,
};

const TONE: Record<InsightTone, string> = {
  positive: "text-brand-success bg-brand-success/10",
  negative: "text-destructive bg-destructive/10",
  highlight: "text-secondary bg-secondary/10",
  neutral: "text-primary bg-primary/10",
};

export function InsightsPanel({ records, columns = 2 }: { records: SaleRecord[]; columns?: number }) {
  const insights = generateInsights(records);

  if (insights.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No insights for the current selection.</p>;
  }

  return (
    <div className={cn("grid gap-3", columns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
      {insights.map((ins, i) => {
        const Icon = ICONS[ins.icon];
        return (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Card className="flex gap-3 p-4 transition-shadow hover:shadow-soft">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", TONE[ins.tone])}>
                <Icon className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{ins.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ins.detail}</p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
