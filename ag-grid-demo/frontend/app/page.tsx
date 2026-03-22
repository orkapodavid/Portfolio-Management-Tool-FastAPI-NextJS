"use client";

import Link from "next/link";
import NavBar from "@/components/nav-bar";

interface FeatureCard {
  title: string;
  description: string;
  href: string;
  color: string;
}

const FEATURES: FeatureCard[] = [
  { title: "01 - Context Menu", description: "Custom right-click menu actions.", href: "/demos/01-context-menu", color: "text-ctp-blue" },
  { title: "02 - Range Selection", description: "Select and aggregate cell ranges.", href: "/demos/02-range-selection", color: "text-ctp-mauve" },
  { title: "03 - Cell Flash", description: "Visual feedback for value changes.", href: "/demos/03-cell-flash", color: "text-ctp-yellow" },
  { title: "04 - Jump & Highlight", description: "Cross-component navigation.", href: "/demos/04-jump-highlight", color: "text-ctp-peach" },
  { title: "05 - Grouping", description: "Row grouping and aggregation.", href: "/demos/05-grouping", color: "text-ctp-mauve" },
  { title: "06 - Notifications", description: "Event-driven notification system.", href: "/demos/06-notifications", color: "text-ctp-red" },
  { title: "07 - Validation", description: "Schema-based input validation.", href: "/demos/07-validation", color: "text-ctp-green" },
  { title: "08 - Clipboard", description: "Copy/paste with Excel compatibility.", href: "/demos/08-clipboard", color: "text-ctp-teal" },
  { title: "09 - Excel Export", description: "Native Excel export with styles.", href: "/demos/09-excel-export", color: "text-ctp-teal" },
  { title: "10 - WebSocket", description: "Real-time streaming updates.", href: "/demos/10-websocket", color: "text-ctp-pink" },
  { title: "11 - Cell Editors", description: "Rich editors (select, date, etc).", href: "/demos/11-cell-editors", color: "text-ctp-mauve" },
  { title: "12 - Edit Pause", description: "Pause updates while editing.", href: "/demos/12-edit-pause", color: "text-ctp-subtext0" },
  { title: "13 - Transaction API", description: "Fast delta updates for large data.", href: "/demos/13-transaction-api", color: "text-ctp-green" },
  { title: "14 - Background Tasks", description: "Running tasks affecting grid state.", href: "/demos/14-background-tasks", color: "text-ctp-red" },
  { title: "15 - Column State", description: "Save/restore column layout.", href: "/demos/15-column-state", color: "text-ctp-blue" },
  { title: "16 - Cell Renderers", description: "Custom cell styling & formatting.", href: "/demos/16-cell-renderers", color: "text-ctp-pink" },
  { title: "17 - Tree Data", description: "Hierarchical data with expand/collapse.", href: "/demos/17-tree-data", color: "text-ctp-teal" },
  { title: "18 - Performance", description: "1000+ row stress test with virtual scroll.", href: "/demos/18-perf-testing", color: "text-ctp-peach" },
  { title: "19 - Status Bar", description: "Row counts and aggregations.", href: "/demos/19-status-bar", color: "text-ctp-teal" },
  { title: "20 - Overlays", description: "Loading and no-rows overlays.", href: "/demos/20-overlays", color: "text-ctp-pink" },
  { title: "21 - CRUD", description: "Create, Read, Update, Delete operations.", href: "/demos/21-crud", color: "text-ctp-green" },
  { title: "22 - Advanced Filter", description: "Enterprise filter builder UI.", href: "/demos/22-advanced-filter", color: "text-ctp-mauve" },
  { title: "23 - Set Filter", description: "Multi-select checkbox filtering.", href: "/demos/23-set-filter", color: "text-ctp-green" },
  { title: "24 - Multi Filter", description: "Combined filter types.", href: "/demos/24-multi-filter", color: "text-ctp-yellow" },
  { title: "25 - Row Numbers", description: "Automatic row numbering column.", href: "/demos/25-row-numbers", color: "text-ctp-subtext0" },
  { title: "26 - Quick Filter", description: "Search text to filter all columns.", href: "/demos/26-quick-filter", color: "text-ctp-blue" },
];

export default function GalleryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 p-6 max-w-[1200px] mx-auto w-full">
        <h1 className="text-3xl font-bold text-ctp-text mb-2">Example Gallery</h1>
        <p className="text-ctp-subtext0 mb-6">
          Comprehensive showcase of AG Grid Enterprise features with Next.js and FastAPI.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="block p-4 rounded-lg border border-ctp-surface1 bg-ctp-mantle hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <h3 className={`font-semibold mb-1 ${f.color}`}>{f.title}</h3>
              <p className="text-xs text-ctp-overlay0">{f.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
