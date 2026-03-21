"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/constants";
import { RefreshCw, Download } from "lucide-react";

export function SubtabNavigation() {
  const pathname = usePathname();

  const activeModule = MODULES.find((m) =>
    pathname.startsWith(`/dashboard/${m.id}`)
  );

  if (!activeModule) return null;

  const pathParts = pathname.split("/");
  const activeSubtab = pathParts[3] || activeModule.subtabs[0].id;

  return (
    <div className="h-9 bg-[#1e1e2e] border-b border-[#313244] flex items-center px-2 gap-0.5 shrink-0">
      {activeModule.subtabs.map((subtab) => (
        <Link
          key={subtab.id}
          href={`/dashboard/${activeModule.id}/${subtab.id}`}
          className={cn(
            "px-3 py-1 rounded text-xs font-medium transition-colors",
            activeSubtab === subtab.id
              ? "bg-blue-600 text-white"
              : "text-[#a6adc8] hover:text-white hover:bg-[#313244]/50"
          )}
        >
          {subtab.label}
        </Link>
      ))}

      <div className="ml-auto flex items-center gap-1">
        <button className="p-1.5 text-[#a6adc8] hover:text-white rounded hover:bg-[#313244]/50">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 text-[#a6adc8] hover:text-white rounded hover:bg-[#313244]/50">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
