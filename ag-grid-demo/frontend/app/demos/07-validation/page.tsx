"use client";

import { useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA, VALIDATION_RULES } from "@/lib/data";
import { SECTORS } from "@/lib/types";
import type { StockRow } from "@/lib/types";

export default function Demo07Page() {
  const [data, setData] = useState<StockRow[]>(() =>
    SAMPLE_DATA.map((row) => ({ ...row }))
  );
  const [lastEvent, setLastEvent] = useState("Edit a cell to validate");

  const [columns] = useState<ColDef[]>([
    { field: "symbol", headerName: "Symbol", editable: true, width: 100 },
    {
      field: "price",
      headerName: "Price",
      editable: true,
      cellEditor: "agNumberCellEditor",
      width: 120,
    },
    {
      field: "qty",
      headerName: "Quantity",
      editable: true,
      cellEditor: "agNumberCellEditor",
      width: 120,
    },
    {
      field: "change",
      headerName: "Change %",
      editable: true,
      cellEditor: "agNumberCellEditor",
      width: 120,
    },
    {
      field: "sector",
      headerName: "Sector",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: [...SECTORS] },
      width: 150,
    },
  ]);

  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    const { colDef, newValue, oldValue, data: rowData, node } = event;
    const field = colDef.field;
    let isValid = true;
    let errorMsg = "";

    switch (field) {
      case "price": {
        const num = Number(newValue);
        if (isNaN(num) || num < 0 || num > 1000000) {
          isValid = false;
          errorMsg = "Price must be between 0 and 1,000,000";
        }
        break;
      }
      case "qty": {
        const num = Number(newValue);
        if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 10000) {
          isValid = false;
          errorMsg = "Quantity must be between 1 and 10,000";
        }
        break;
      }
      case "change": {
        const num = Number(newValue);
        if (isNaN(num) || num < -100 || num > 100) {
          isValid = false;
          errorMsg = "Change must be between -100% and 100%";
        }
        break;
      }
      case "symbol": {
        const str = String(newValue);
        if (!/^[A-Z]{1,5}$/.test(str)) {
          isValid = false;
          errorMsg = "Symbol must be 1-5 uppercase letters";
        }
        break;
      }
      case "sector": {
        if (!SECTORS.includes(newValue as (typeof SECTORS)[number])) {
          isValid = false;
          errorMsg = "Invalid sector";
        }
        break;
      }
    }

    if (!isValid) {
      rowData[field as keyof StockRow] = oldValue;
      node?.setData({ ...rowData });
      setLastEvent(`Validation error: ${errorMsg}`);
    } else {
      setData((prev) =>
        prev.map((row) =>
          row.id === rowData.id ? { ...rowData } : row
        )
      );
      setLastEvent(`Valid: ${field} updated to ${newValue}`);
    }
  }, []);

  return (
    <DemoLayout
      title="07 - Cell Validation"
      description="Edit any cell to see schema-based validation in action. Invalid values are reverted and an error message is shown. Valid changes are accepted."
    >
      <div className="mb-4 overflow-x-auto">
        <table className="text-xs border border-ctp-surface1 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-ctp-surface0">
              <th className="px-3 py-2 text-left text-ctp-text font-semibold">
                Field
              </th>
              <th className="px-3 py-2 text-left text-ctp-text font-semibold">
                Type
              </th>
              <th className="px-3 py-2 text-left text-ctp-text font-semibold">
                Constraints
              </th>
            </tr>
          </thead>
          <tbody>
            {VALIDATION_RULES.map((rule) => (
              <tr
                key={rule.field}
                className="border-t border-ctp-surface1 bg-ctp-mantle"
              >
                <td className="px-3 py-1.5 text-ctp-blue font-mono">
                  {rule.field}
                </td>
                <td className="px-3 py-1.5 text-ctp-subtext0">{rule.type}</td>
                <td className="px-3 py-1.5 text-ctp-subtext0">
                  {rule.constraints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <StatusBadge lastEvent={lastEvent} />
      </div>

      <div style={{ height: "50vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={data}
          columnDefs={columns}
          getRowId={(params) => params.data.id}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
    </DemoLayout>
  );
}
