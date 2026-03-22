"use client";

import { useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellClickedEvent,
  SelectionChangedEvent,
} from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

export default function Demo01Page() {
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const [lastEvent, setLastEvent] = useState("No events yet");

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selected = event.api.getSelectedRows();
    setLastEvent(`Selected ${selected.length} row(s)`);
  }, []);

  const onCellClicked = useCallback((event: CellClickedEvent) => {
    setLastEvent(
      `Clicked cell: ${event.colDef.field} = ${event.value} (row ${event.rowIndex})`
    );
  }, []);

  return (
    <DemoLayout
      title="01 - Context Menu"
      description="Right-click on any cell or row to open the enterprise context menu. The menu provides built-in actions like copy, paste, export, and chart range."
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1">
          <span className="text-ctp-peach text-sm">Tip:</span>
          <span className="text-xs text-ctp-subtext0">
            Right-click on any cell to see the enterprise context menu with copy, export, and chart options.
          </span>
        </div>
        <StatusBadge lastEvent={lastEvent} />
      </div>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={SAMPLE_DATA}
          columnDefs={columns}
          rowSelection={{ mode: "multiRow" }}
          onSelectionChanged={onSelectionChanged}
          onCellClicked={onCellClicked}
        />
      </div>
    </DemoLayout>
  );
}
