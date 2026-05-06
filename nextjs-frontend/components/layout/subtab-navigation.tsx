"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LAYOUT, MODULES } from "@/lib/constants";

export function SubtabNavigation() {
  const pathname = usePathname();

  const activeModule = MODULES.find((m) =>
    pathname.startsWith(`/dashboard/${m.id}`)
  );

  if (!activeModule) return null;

  const pathParts = pathname.split("/");
  const activeSubtab = pathParts[3] || activeModule.subtabs[0]?.id;

  return (
    <div
      className="flex flex-row items-center bg-white border-b border-gray-200 px-2 pt-0.5 overflow-hidden no-scrollbar shrink-0 w-full max-w-full flex-nowrap"
      style={{ height: LAYOUT.SUBTAB_HEIGHT }}
    >
      {activeModule.subtabs.map((subtab) => {
        const isActive = activeSubtab === subtab.id;
        return (
          <Link
            key={subtab.id}
            href={`/dashboard/${activeModule.id}/${subtab.id}`}
            className="h-full flex items-center"
          >
            <span
              className={cn(
                "px-3 h-full flex items-center text-[9px] uppercase tracking-tighter whitespace-nowrap border-b-2",
                isActive
                  ? "font-black text-blue-600 border-blue-600"
                  : "font-bold text-gray-400 border-transparent hover:text-gray-600"
              )}
            >
              {subtab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
