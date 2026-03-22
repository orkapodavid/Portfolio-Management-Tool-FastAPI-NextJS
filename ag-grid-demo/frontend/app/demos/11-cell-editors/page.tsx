"use client";

import { useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellEditingStartedEvent, CellEditingStoppedEvent, CellValueChangedEvent } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA } from "@/lib/data";
import { getEditableColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

const EDITOR_TYPES = [
  { column: "Company", editorType: "Text (default)" },
  { column: "Sector", editorType: "Select dropdown" },
  { column: "Price", editorType: "Number editor" },
  { column: "Qty", editorType: "Large text popup" },
  { column: "Active", editorType: "Checkbox" },
];

export default function Demo11Page() {
  const [columns] = useState<ColDef[]>(() => {
    const cols = getEditableColumns();
    const qtyCol = cols.find((c) => c.field === "qty");
    if (qtyCol) {
      qtyCol.cellEditor = "agLargeTextCellEditor";
      qtyCol.cellEditorPopup = true;
    }
    return cols;
  });
  const [data, setData] = useState<StockRow[]>(() =>
    SAMPLE_DATA.map((row) => ({ ...row }))
  );
  const [lastEvent, setLastEvent] = useState("Click a cell to edit");

  const onCellEditingStarted = useCallback(
    (event: CellEditingStartedEvent) => {
      setLastEvent(
        `Editing started: ${event.colDef.field} on row ${event.data.symbol}`
      );
    },
    []
  );

  const onCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent) => {
      setLastEvent(
        `Editing stopped: ${event.colDef.field} on row ${event.data.symbol}`
      );
    },
    []
  );

  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent) => {
      setLastEvent(
        `Value changed: ${event.colDef.field} = ${event.newValue} (was ${event.oldValue})`
      );
      setData((prev) =>
        prev.map((row) =>
          row.id === event.data.id ? { ...event.data } : row
        )
      );
    },
    []
  );

  return (
    <DemoLayout
      title="11 - Cell Editors"
      description="Different cell editor types including text, select dropdown, number, large text popup, and checkbox. Double-click any editable cell to activate its editor."
    >
      <div className="mb-4 border border-ctp-surface1 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ctp-surface0">
              <th className="text-left px-4 py-2 text-ctp-text font-semibold">
                Column
              </th>
              <th className="text-left px-4 py-2 text-ctp-text font-semibold">
                Editor Type
              </th>
            </tr>
          </thead>
          <tbody>
            {EDITOR_TYPES.map((row) => (
              <tr
                key={row.column}
                className="border-t border-ctp-surface1 bg-ctp-mantle"
              >
                <td className="px-4 py-2 text-ctp-text">{row.column}</td>
                <td className="px-4 py-2 text-ctp-subtext0">
                  {row.editorType}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <StatusBadge lastEvent={lastEvent} />
      </div>

      <div style={{ height: "55vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={data}
          columnDefs={columns}
          getRowId={(params) => params.data.id}
          onCellEditingStarted={onCellEditingStarted}
          onCellEditingStopped={onCellEditingStopped}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
    </DemoLayout>
  );
}
