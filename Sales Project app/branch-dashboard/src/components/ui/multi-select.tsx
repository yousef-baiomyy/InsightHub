"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
}

export function MultiSelect({ label, options, selected, onToggle, className }: MultiSelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <span className="text-muted-foreground">{label}</span>
            {selected.length > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-[11px]">{selected.length}</Badge>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 w-56 overflow-y-auto">
        {options.length === 0 && <div className="px-2 py-3 text-sm text-muted-foreground">No options</div>}
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-muted"
            >
              <span className={cn("flex h-4 w-4 items-center justify-center rounded border", active ? "gradient-primary border-transparent text-white" : "border-border")}>
                {active && <Check className="h-3 w-3" />}
              </span>
              <span className="truncate">{opt}</span>
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
