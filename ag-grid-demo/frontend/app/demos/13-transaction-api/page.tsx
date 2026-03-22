"use client";

import { useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme, defaultColDef } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

export default function Demo13Page() {
  const gridRef = useRef<AgGridReact<StockRow>>(null);
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const [data] = useState<StockRow[]>(() =>
    SAMPLE_DATA.map((row) => ({ ...row }))
  );
  const [lastEvent, setLastEvent] = useState("Ready - use buttons to modify rows");
  const nextIdRef = useRef(data.length + 1);

  const getApi = useCallback((): GridApi | null => {
    return gridRef.current?.api ?? null;
  }, []);

  const handleAddRow = useCallback(() => {
    const api = getApi();
    if (!api) return;
    const id = nextIdRef.current++;
    const newRow: StockRow = {
      id: `row_${id}`,
      symbol: "NEW",
      company: `New Company ${id}`,
      sector: "Technology",
      price: Math.round(Math.random() * 500 * 100) / 100,
      qty: Math.floor(Math.random() * 1000) + 1,
      change: Math.round((Math.random() * 10 - 5) * 100) / 100,
      active: true,
      status: "Active",
    };
    const result = api.applyTransaction({ add: [newRow] });
    setLastEvent(
      `applyTransaction({ add }): added ${result?.add?.length ?? 0} row (${newRow.id})`
    );
  }, [getApi]);

  const handleUpdateRandom = useCallback(() => {
    const api = getApi();
    if (!api) return;
    const rowCount = api.getDisplayedRowCount();
    if (rowCount === 0) {
      setLastEvent("No rows to update");
      return;
    }
    const idx = Math.floor(Math.random() * rowCount);
    const rowNode = api.getDisplayedRowAtIndex(idx);
    if (!rowNode?.data) return;
    const delta = Math.round((Math.random() * 10 - 5) * 100) / 100;
    const updatedRow: StockRow = {
      ...rowNode.data,
      price: Math.max(0.01, Math.round((rowNode.data.price + delta) * 100) / 100),
      change: Math.round(delta * 100) / 100,
    };
    const result = api.applyTransaction({ update: [updatedRow] });
    setLastEvent(
      `applyTransaction({ update }): ${updatedRow.symbol} price=${updatedRow.price} (${result?.update?.length ?? 0} row)`
    );
  }, [getApi]);

  const handleRemoveLast = useCallback(() => {
    const api = getApi();
    if (!api) return;
    const rowCount = api.getDisplayedRowCount();
    if (rowCount === 0) {
      setLastEvent("No rows to remove");
      return;
    }
    const lastNode = api.getDisplayedRowAtIndex(rowCount - 1);
    if (!lastNode?.data) return;
    const result = api.applyTransaction({ remove: [lastNode.data] });
    setLastEvent(
      `applyTransaction({ remove }): removed ${result?.remove?.length ?? 0} row (${lastNode.data.id})`
    );
  }, [getApi]);

  return (
    <DemoLayout
      title="13 - Transaction API"
      description="Uses AG Grid's applyTransaction() API for efficient delta updates. Add, update, and remove individual rows without replacing the entire dataset."
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleAddRow}
          className="px-4 py-2 rounded-lg bg-ctp-green/20 text-ctp-green border border-ctp-green/30 text-sm font-medium hover:bg-ctp-green/30 transition-colors"
        >
          Add Row
        </button>
        <button
          onClick={handleUpdateRandom}
          className="px-4 py-2 rounded-lg bg-ctp-blue/20 text-ctp-blue border border-ctp-blue/30 text-sm font-medium hover:bg-ctp-blue/30 transition-colors"
        >
          Update Random
        </button>
        <button
          onClick={handleRemoveLast}
          className="px-4 py-2 rounded-lg bg-ctp-red/20 text-ctp-red border border-ctp-red/30 text-sm font-medium hover:bg-ctp-red/30 transition-colors"
        >
          Remove Last
        </button>
        <StatusBadge lastEvent={lastEvent} />
      </div>

      <div style={{ height: "55vh", width: "100%" }}>
        <AgGridReact<StockRow>
          ref={gridRef}
          theme={gridTheme}
            defaultColDef={defaultColDef}
          rowData={data}
          columnDefs={columns}
          getRowId={(params) => params.data.id}
        />
      </div>

      <div className="mt-4 p-4 rounded-lg bg-ctp-mantle border border-ctp-surface1">
        <h3 className="text-sm font-semibold text-ctp-text mb-2">
          Transaction API Usage (this demo uses these calls)
        </h3>
        <pre className="text-xs text-ctp-subtext0 overflow-x-auto">
{`// Add rows - matched by getRowId
const result = api.applyTransaction({ add: [newRow] });
// result.add contains the added RowNodes

// Update rows - matched by getRowId
const result = api.applyTransaction({ update: [updatedRow] });
// result.update contains the updated RowNodes

// Remove rows - matched by getRowId
const result = api.applyTransaction({ remove: [rowToRemove] });
// result.remove contains the removed RowNodes`}
        </pre>
      </div>
    </DemoLayout>
  );
}
