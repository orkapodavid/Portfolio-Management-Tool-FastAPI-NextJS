"use client";

import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import { SAMPLE_DATA } from "@/lib/data";
import type { StockRow } from "@/lib/types";

export default function Demo05Page() {
  const [columns] = useState<ColDef[]>([
    { field: "symbol", headerName: "Symbol", enableRowGroup: true, width: 120 },
    { field: "company", headerName: "Company", enableRowGroup: true, flex: 1 },
    { field: "sector", headerName: "Sector", rowGroup: true, hide: true },
    { field: "price", headerName: "Price", aggFunc: "avg", width: 120 },
    { field: "qty", headerName: "Quantity", aggFunc: "sum", width: 120 },
    { field: "change", headerName: "Change %", aggFunc: "avg", width: 120 },
  ]);

  return (
    <DemoLayout
      title="05 - Row Grouping"
      description="Rows are grouped by sector with aggregation functions applied to numeric columns. Drag column headers to the grouping panel to change the grouping, or expand/collapse groups."
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1">
          <span className="text-ctp-peach text-sm">Tip:</span>
          <span className="text-xs text-ctp-subtext0">
            Drag column headers to the grouping panel above the grid to add or change row groups.
          </span>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-ctp-green/20 text-ctp-green border border-ctp-green/30">
          Grouped by: Sector
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-ctp-mauve/20 text-ctp-mauve border border-ctp-mauve/30">
          Grand Total: Bottom
        </span>
      </div>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={SAMPLE_DATA}
          columnDefs={columns}
          defaultColDef={{ enableRowGroup: true }}
          rowGroupPanelShow="always"
          groupDefaultExpanded={-1}
          grandTotalRow="bottom"
          sideBar={true}
        />
      </div>
    </DemoLayout>
  );
}
