"use client";

import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import { SAMPLE_DATA } from "@/lib/data";
import type { StockRow } from "@/lib/types";

export default function Demo24Page() {
  const [columns] = useState<ColDef[]>(() => [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "symbol",
      headerName: "Symbol",
      width: 120,
      filter: "agMultiColumnFilter",
      filterParams: {
        filters: [
          { filter: "agTextColumnFilter", display: "accordion", title: "Text Filter" },
          { filter: "agSetColumnFilter", display: "accordion", title: "Set Filter" },
        ],
      },
    },
    {
      field: "sector",
      headerName: "Sector",
      filter: "agMultiColumnFilter",
      filterParams: {
        filters: [
          {
            filter: "agTextColumnFilter",
            display: "accordion",
            title: "Text Filter",
            filterParams: { buttons: ["reset"] },
          },
          { filter: "agSetColumnFilter", display: "accordion", title: "Set Filter" },
        ],
      },
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      filter: "agMultiColumnFilter",
      filterParams: {
        filters: [
          { filter: "agNumberColumnFilter", display: "accordion", title: "Number Filter" },
          { filter: "agSetColumnFilter", display: "accordion", title: "Set Filter" },
        ],
      },
    },
    { field: "qty", headerName: "Quantity", width: 120 },
    { field: "change", headerName: "Change %", width: 120 },
  ]);

  return (
    <DemoLayout
      title="24 - Multi Filter"
      description="Combined filter types with accordion display. Each column can have multiple filter types stacked in an accordion layout, allowing you to use different filter strategies together."
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1 mb-4">
        <span className="text-ctp-peach text-sm">Tip:</span>
        <span className="text-xs text-ctp-subtext0">
          Click the filter icon on Symbol, Sector, or Price columns and expand the accordion sections to see multiple filter types combined.
        </span>
      </div>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={SAMPLE_DATA}
          columnDefs={columns}
          getRowId={(params) => params.data.id}
        />
      </div>
    </DemoLayout>
  );
}
