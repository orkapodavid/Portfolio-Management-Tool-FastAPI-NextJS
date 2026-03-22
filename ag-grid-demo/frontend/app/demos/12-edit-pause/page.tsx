"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellEditingStartedEvent, CellEditingStoppedEvent } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme, defaultColDef } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA, simulatePriceTick } from "@/lib/data";
import { getEditableColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

export default function Demo12Page() {
  const gridRef = useRef<AgGridReact<StockRow>>(null);
  const [columns] = useState<ColDef[]>(getEditableColumns);
  const dataRef = useRef<StockRow[]>(SAMPLE_DATA.map((row) => ({ ...row })));
  const [data, setData] = useState<StockRow[]>(dataRef.current);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pauseOnEdit, setPauseOnEdit] = useState(false);
  const [lastEvent, setLastEvent] = useState("Ready");

  useEffect(() => {
    if (!isStreaming || pauseOnEdit) return;

    const interval = setInterval(() => {
      const { updatedRows, idx } = simulatePriceTick(dataRef.current);
      dataRef.current = updatedRows;
      const row = updatedRows[idx];
      setData(updatedRows);
      setLastEvent(`Updated ${row.symbol}: price=${row.price}`);
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming, pauseOnEdit]);

  const onCellEditingStarted = useCallback(
    (event: CellEditingStartedEvent) => {
      setIsEditing(true);
      setPauseOnEdit(true);
      setLastEvent(`Editing: ${event.colDef.field} on ${event.data.symbol}`);
    },
    []
  );

  const onCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent) => {
      setIsEditing(false);
      setLastEvent(
        `Edit complete: ${event.colDef.field} on ${event.data.symbol}`
      );
    },
    []
  );

  const handleUndo = useCallback(() => {
    gridRef.current?.api.undoCellEditing();
    setLastEvent("Undo performed");
  }, []);

  const handleRedo = useCallback(() => {
    gridRef.current?.api.redoCellEditing();
    setLastEvent("Redo performed");
  }, []);

  return (
    <DemoLayout
      title="12 - Edit Pause + Undo/Redo"
      description="Streaming auto-pauses when you start editing a cell. Use undo/redo to revert or reapply cell edits. Resume streaming manually after editing."
    >
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {isStreaming && pauseOnEdit ? (
          <button
            onClick={() => setPauseOnEdit(false)}
            className="px-4 py-2 rounded-lg bg-ctp-green/20 text-ctp-green border border-ctp-green/30 text-sm font-medium hover:bg-ctp-green/30 transition-colors"
          >
            Resume
          </button>
        ) : isStreaming ? (
          <button
            onClick={() => {
              setIsStreaming(false);
              setLastEvent("Streaming stopped");
            }}
            className="px-4 py-2 rounded-lg bg-ctp-red/20 text-ctp-red border border-ctp-red/30 text-sm font-medium hover:bg-ctp-red/30 transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={() => {
              setIsStreaming(true);
              setPauseOnEdit(false);
              setLastEvent("Streaming started");
            }}
            className="px-4 py-2 rounded-lg bg-ctp-green/20 text-ctp-green border border-ctp-green/30 text-sm font-medium hover:bg-ctp-green/30 transition-colors"
          >
            Start
          </button>
        )}

        <button
          onClick={handleUndo}
          className="px-4 py-2 rounded-lg bg-ctp-peach/20 text-ctp-peach border border-ctp-peach/30 text-sm font-medium hover:bg-ctp-peach/30 transition-colors"
        >
          Undo
        </button>
        <button
          onClick={handleRedo}
          className="px-4 py-2 rounded-lg bg-ctp-mauve/20 text-ctp-mauve border border-ctp-mauve/30 text-sm font-medium hover:bg-ctp-mauve/30 transition-colors"
        >
          Redo
        </button>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
            isEditing
              ? "bg-ctp-peach/20 text-ctp-peach border-ctp-peach/30"
              : "bg-ctp-green/20 text-ctp-green border-ctp-green/30"
          }`}
        >
          {isEditing ? "EDITING" : "Ready"}
        </span>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
            pauseOnEdit
              ? "bg-ctp-red/20 text-ctp-red border-ctp-red/30"
              : "bg-ctp-blue/20 text-ctp-blue border-ctp-blue/30"
          }`}
        >
          {pauseOnEdit ? "PAUSED" : "ACTIVE"}
        </span>

        <StatusBadge lastEvent={lastEvent} />
      </div>

      <p className="text-xs text-ctp-overlay0 mb-4">
        You can also use Ctrl+Z / Ctrl+Y (Cmd+Z / Cmd+Y on Mac) for
        undo/redo while the grid is focused.
      </p>

      <div style={{ height: "55vh", width: "100%" }}>
        <AgGridReact<StockRow>
          ref={gridRef}
          theme={gridTheme}
            defaultColDef={defaultColDef}
          rowData={data}
          columnDefs={columns}
          getRowId={(params) => params.data.id}
          undoRedoCellEditing={true}
          undoRedoCellEditingLimit={20}
          onCellEditingStarted={onCellEditingStarted}
          onCellEditingStopped={onCellEditingStopped}
        />
      </div>
    </DemoLayout>
  );
}
