"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DEMOS = [
  { label: "Gallery", href: "/" },
  { label: "01-Menu", href: "/demos/01-context-menu" },
  { label: "02-Range", href: "/demos/02-range-selection" },
  { label: "03-Flash", href: "/demos/03-cell-flash" },
  { label: "04-Jump", href: "/demos/04-jump-highlight" },
  { label: "05-Group", href: "/demos/05-grouping" },
  { label: "06-Notify", href: "/demos/06-notifications" },
  { label: "07-Valid", href: "/demos/07-validation" },
  { label: "08-Copy", href: "/demos/08-clipboard" },
  { label: "09-Export", href: "/demos/09-excel-export" },
  { label: "10-WS", href: "/demos/10-websocket" },
  { label: "11-Edit", href: "/demos/11-cell-editors" },
  { label: "12-Pause", href: "/demos/12-edit-pause" },
  { label: "13-Trans", href: "/demos/13-transaction-api" },
  { label: "14-Tasks", href: "/demos/14-background-tasks" },
  { label: "15-State", href: "/demos/15-column-state" },
  { label: "16-Render", href: "/demos/16-cell-renderers" },
  { label: "17-Tree", href: "/demos/17-tree-data" },
  { label: "18-Perf", href: "/demos/18-perf-testing" },
  { label: "19-Status", href: "/demos/19-status-bar" },
  { label: "20-Overlay", href: "/demos/20-overlays" },
  { label: "21-CRUD", href: "/demos/21-crud" },
  { label: "22-Filter", href: "/demos/22-advanced-filter" },
  { label: "23-Set", href: "/demos/23-set-filter" },
  { label: "24-Multi", href: "/demos/24-multi-filter" },
  { label: "25-RowNum", href: "/demos/25-row-numbers" },
  { label: "26-Search", href: "/demos/26-quick-filter" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-ctp-mantle border-b border-ctp-surface0 px-4 py-2 w-full">
      <div className="flex items-center gap-3 overflow-x-auto">
        <span className="font-bold text-ctp-blue whitespace-nowrap">
          AG Grid Demo
        </span>
        <div className="w-px h-5 bg-ctp-surface1" />
        <div className="flex items-center gap-2 overflow-x-auto">
          {DEMOS.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className={`whitespace-nowrap text-xs px-2 py-1 rounded transition-colors ${
                pathname === d.href
                  ? "bg-ctp-blue text-ctp-crust font-bold"
                  : "text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0"
              }`}
            >
              {d.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
