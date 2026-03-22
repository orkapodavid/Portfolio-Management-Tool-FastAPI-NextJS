"use client";

import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import { SAMPLE_DATA } from "@/lib/data";
import type { StockRow } from "@/lib/types";

export default function Demo23Page() {
  const [columns] = useState<ColDef[]>(() => [
    { field: "id", headerName: "ID", width: 80, filter: "agTextColumnFilter" },
    { field: "symbol", headerName: "Symbol", width: 120, filter: "agTextColumnFilter" },
    {
      field: "sector",
      headerName: "Sector",
      filter: "agSetColumnFilter",
      filterParams: { buttons: ["reset", "apply"] },
    },
    { field: "status", headerName: "Status", filter: "agSetColumnFilter" },
    { field: "price", headerName: "Price", width: 120, filter: "agNumberColumnFilter" },
    { field: "qty", headerName: "Quantity", width: 120, filter: "agNumberColumnFilter" },
  ]);

  return (
    <DemoLayout
      title="23 - Set Filter"
      description="Multi-select checkbox filter. Use the Set Filter on the Sector and Status columns to filter rows by selecting or deselecting values from a checkbox list."
    >
      <p className="text-xs text-ctp-subtext0 mb-4">
        This demo uses AG Grid Enterprise Set Filter. Click the filter icon on the Sector or Status columns to see the multi-select checkbox filter.
      </p>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={SAMPLE_DATA}
          columnDefs={columns}
          sideBar="filters"
          autoSizeStrategy={{ type: "fitCellContents" }}
          getRowId={(params) => params.data.id}
        />
      </div>
    </DemoLayout>
  );
}
