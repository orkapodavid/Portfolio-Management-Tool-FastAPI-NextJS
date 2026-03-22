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

export default function Demo25Page() {
  const [columns] = useState<ColDef[]>(() => [
    {
      headerName: "#",
      valueGetter: "node.rowIndex + 1",
      width: 60,
      sortable: false,
      filter: false,
    },
    ...getBasicColumns(),
  ]);

  return (
    <DemoLayout
      title="25 - Row Numbers"
      description="Automatic row numbering. A dedicated first column displays the row number, which automatically updates when rows are sorted or filtered."
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1 mb-4">
        <span className="text-ctp-peach text-sm">Note:</span>
        <span className="text-xs text-ctp-subtext0">
          Row numbers update dynamically when you sort or filter the grid. Try sorting a column to see the numbers recalculate.
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
