"use client";

import { useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  SelectionChangedEvent,
} from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

export default function Demo02Page() {
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const [lastEvent, setLastEvent] = useState("No selection yet");

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selected = event.api.getSelectedRows();
    setLastEvent(`Selected ${selected.length} row(s)`);
  }, []);

  return (
    <DemoLayout
      title="02 - Range Selection"
      description="Select multiple cells by clicking and dragging across the grid. Hold Shift+Click to extend a selection, or use Ctrl/Cmd+Click to add to the current selection."
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1">
          <span className="text-ctp-peach text-sm">Tip:</span>
          <span className="text-xs text-ctp-subtext0">
            Use Shift+Click to extend selection, or click and drag to select a range of cells.
          </span>
        </div>
        <StatusBadge lastEvent={lastEvent} />
      </div>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={SAMPLE_DATA}
          columnDefs={columns}
          cellSelection={true}
          rowSelection={{ mode: "multiRow" }}
          onSelectionChanged={onSelectionChanged}
        />
      </div>
    </DemoLayout>
  );
}
