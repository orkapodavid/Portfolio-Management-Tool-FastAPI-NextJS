"use client";

import { useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

const STORAGE_KEY = "gridState15";

export default function Demo15Page() {
  const gridRef = useRef<AgGridReact<StockRow>>(null);
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const [data] = useState<StockRow[]>(() =>
    SAMPLE_DATA.map((row) => ({ ...row }))
  );
  const [lastEvent, setLastEvent] = useState("Reorder or resize columns, then save state");

  const onGridReady = useCallback((event: GridReadyEvent) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        event.api.applyColumnState({ state, applyOrder: true });
        setLastEvent("Restored saved column state");
      } catch {
        setLastEvent("Failed to restore state");
      }
    }
  }, []);

  const handleSave = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) return;
    const state = api.getColumnState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setLastEvent("Column state saved to localStorage");
  }, []);

  const handleRestore = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setLastEvent("No saved state found");
      return;
    }
    try {
      const state = JSON.parse(saved);
      gridRef.current?.api.applyColumnState({ state, applyOrder: true });
      setLastEvent("Column state restored from localStorage");
    } catch {
      setLastEvent("Failed to restore state");
    }
  }, []);

  const handleReset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    gridRef.current?.api.resetColumnState();
    setLastEvent("Column state reset to default");
  }, []);

  return (
    <DemoLayout
      title="15 - Column State"
      description="Save and restore grid column state (order, width, sort, visibility) to localStorage. Drag columns to reorder, resize them, or apply sorts, then save the state."
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-ctp-green/20 text-ctp-green border border-ctp-green/30 text-sm font-medium hover:bg-ctp-green/30 transition-colors"
        >
          Save State
        </button>
        <button
          onClick={handleRestore}
          className="px-4 py-2 rounded-lg bg-ctp-blue/20 text-ctp-blue border border-ctp-blue/30 text-sm font-medium hover:bg-ctp-blue/30 transition-colors"
        >
          Restore State
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-ctp-overlay0/20 text-ctp-overlay0 border border-ctp-overlay0/30 text-sm font-medium hover:bg-ctp-overlay0/30 transition-colors"
        >
          Reset
        </button>
        <StatusBadge lastEvent={lastEvent} />
      </div>

      <div style={{ height: "55vh", width: "100%" }}>
        <AgGridReact<StockRow>
          ref={gridRef}
          theme={gridTheme}
          rowData={data}
          columnDefs={columns}
          getRowId={(params) => params.data.id}
          onGridReady={onGridReady}
        />
      </div>

      <p className="text-xs text-ctp-overlay0 mt-4">
        The full Column State API supports saving sort, filter, column
        order, widths, visibility, pinning, and aggregation settings.
        Use api.getColumnState() and api.applyColumnState() to
        persist and restore the complete grid layout.
      </p>
    </DemoLayout>
  );
}
