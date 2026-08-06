"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  delay?: number;
}

export function ChartCard({ title, subtitle, action, className, children, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      <Card className="card-gradient h-full p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold leading-tight">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
        <div className={cn("w-full")}>{children}</div>
      </Card>
    </motion.div>
  );
}
