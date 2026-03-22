"use client";

import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

export default function Demo19Page() {
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const [lastEvent] = useState("Status bar active");

  const statusBar = {
    statusPanels: [
      { statusPanel: "agTotalRowCountComponent", align: "left" as const },
      { statusPanel: "agFilteredRowCountComponent", align: "left" as const },
      { statusPanel: "agSelectedRowCountComponent", align: "center" as const },
      { statusPanel: "agAggregationComponent", align: "right" as const },
    ],
  };

  return (
    <DemoLayout
      title="19 - Status Bar"
      description="Status bar with aggregation panels. Select rows and numeric columns to see aggregation values (sum, avg, min, max, count) in the bottom bar."
    >
      <div className="flex items-center gap-3 mb-4">
        <StatusBadge lastEvent={lastEvent} />
      </div>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={SAMPLE_DATA}
          columnDefs={columns}
          rowSelection={{ mode: "multiRow" }}
          cellSelection={true}
          statusBar={statusBar}
          getRowId={(params) => params.data.id}
        />
      </div>

      <pre className="mt-4 p-4 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1 text-xs text-ctp-subtext0 overflow-x-auto">
{`statusBar={{
  statusPanels: [
    { statusPanel: "agTotalRowCountComponent", align: "left" },
    { statusPanel: "agFilteredRowCountComponent", align: "left" },
    { statusPanel: "agSelectedRowCountComponent", align: "center" },
    { statusPanel: "agAggregationComponent", align: "right" },
  ]
}}`}
      </pre>
    </DemoLayout>
  );
}
