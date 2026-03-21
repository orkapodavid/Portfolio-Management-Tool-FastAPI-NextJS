"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/constants";
import {
  BarChart3,
  Briefcase,
  TrendingUp,
  Shield,
  GitCompare,
  FileCheck,
  Wrench,
  Search,
  Calendar,
  Settings,
  ArrowUpDown,
  Bell,
  User,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  BarChart3,
  Briefcase,
  TrendingUp,
  Shield,
  GitCompare,
  FileCheck,
  Wrench,
  Search,
  Calendar,
  Settings,
  ArrowUpDown,
};

export function TopNavigation() {
  const pathname = usePathname();

  const activeModule = MODULES.find((m) =>
    pathname.startsWith(`/dashboard/${m.id}`)
  );

  return (
    <nav className="h-10 bg-[#1e1e2e] border-b border-[#313244] flex items-center px-2 gap-0.5 shrink-0">
      <Link
        href="/dashboard/market-data/market-data"
        className="text-sm font-semibold text-blue-400 px-3 py-1 mr-2"
      >
        PMT
      </Link>

      {MODULES.map((mod) => {
        const Icon = iconMap[mod.icon];
        const isActive = activeModule?.id === mod.id;

        return (
          <Link
            key={mod.id}
            href={`/dashboard/${mod.id}/${mod.subtabs[0].id}`}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
              isActive
                ? "bg-[#313244] text-white"
                : "text-[#a6adc8] hover:text-white hover:bg-[#313244]/50"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{mod.label}</span>
          </Link>
        );
      })}

      <div className="ml-auto flex items-center gap-2">
        <button className="p-1.5 text-[#a6adc8] hover:text-white rounded">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-[#a6adc8] hover:text-white rounded">
          <User className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
