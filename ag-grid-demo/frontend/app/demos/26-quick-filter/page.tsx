"use client";

import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import { SAMPLE_DATA } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

export default function Demo26Page() {
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const [searchText, setSearchText] = useState("");

  return (
    <DemoLayout
      title="26 - Quick Filter"
      description="Global text search across all columns. Type in the search box to instantly filter rows matching the search term in any column."
    >
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-ctp-subtext0 font-medium">Search:</label>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Type to search..."
          style={{ width: 300 }}
          className="px-3 py-2 rounded-lg bg-ctp-surface0 text-ctp-text border border-ctp-surface1 text-sm placeholder:text-ctp-overlay0 focus:outline-none focus:border-ctp-blue"
        />
        <button
          onClick={() => setSearchText("")}
          className="px-4 py-2 rounded-lg bg-ctp-overlay0/20 text-ctp-subtext0 border border-ctp-overlay0/30 text-sm font-medium hover:bg-ctp-overlay0/30 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1 mb-4">
        <span className="text-ctp-peach text-sm">Note:</span>
        <span className="text-xs text-ctp-subtext0">
          Quick Filter is a Community feature. It searches across all visible columns and updates results as you type.
        </span>
      </div>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={SAMPLE_DATA}
          columnDefs={columns}
          quickFilterText={searchText}
          getRowId={(params) => params.data.id}
        />
      </div>
    </DemoLayout>
  );
}
