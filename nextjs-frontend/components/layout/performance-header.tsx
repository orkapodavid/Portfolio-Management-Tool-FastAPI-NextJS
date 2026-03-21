"use client";

import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

function KPICard({ label, value, change, isPositive }: KPICardProps) {
  return (
    <div className="flex flex-col items-center px-4 py-1 border-r border-[#313244] last:border-r-0">
      <span className="text-[10px] text-[#a6adc8] uppercase tracking-wider">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold",
          isPositive === undefined
            ? "text-white"
            : isPositive
              ? "text-[#00A651]"
              : "text-[#C00000]"
        )}
      >
        {value}
      </span>
      {change && (
        <span
          className={cn(
            "text-[10px]",
            isPositive ? "text-[#00A651]" : "text-[#C00000]"
          )}
        >
          {change}
        </span>
      )}
    </div>
  );
}

export function PerformanceHeader() {
  return (
    <div className="h-[52px] bg-[#181825] border-b border-[#313244] flex items-center px-4 shrink-0">
      <KPICard label="Daily P&L" value="+$12.5M" change="+0.5%" isPositive />
      <KPICard label="Pos FX" value="+$2.3M" change="+0.3%" isPositive />
      <KPICard label="CCY Hedge" value="-$450K" change="-0.1%" isPositive={false} />
      <KPICard label="YTD Disc" value="+$89.2M" change="+3.8%" isPositive />
      <KPICard label="YTD R/U" value="+$45.6M" change="+2.1%" isPositive />
    </div>
  );
}
