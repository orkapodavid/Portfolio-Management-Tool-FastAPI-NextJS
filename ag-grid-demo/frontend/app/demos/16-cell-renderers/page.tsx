"use client";

import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellStyle } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import { SAMPLE_DATA } from "@/lib/data";
import type { StockRow } from "@/lib/types";

const STYLE_EXAMPLES = [
  {
    label: "Symbol",
    description: "Blue link style with bold font weight",
    color: "text-ctp-blue",
  },
  {
    label: "Change %",
    description: "Green for positive, red for negative values",
    color: "text-ctp-green",
  },
  {
    label: "Status",
    description: "Badge styling with colored backgrounds based on value",
    color: "text-ctp-peach",
  },
];

export default function Demo16Page() {
  const [columns] = useState<ColDef<StockRow>[]>([
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "symbol",
      headerName: "Symbol",
      width: 120,
      cellStyle: {
        color: "#2563eb",
        cursor: "pointer",
        fontWeight: 600,
      } as CellStyle,
    },
    {
      field: "sector",
      headerName: "Sector",
      filter: "agTextColumnFilter",
      flex: 1,
    },
    {
      field: "change",
      headerName: "Change %",
      width: 120,
      cellStyle: (params) => {
        if (params.value > 0) {
          return { color: "#059669", fontWeight: 600 };
        }
        if (params.value < 0) {
          return { color: "#dc2626", fontWeight: 600 };
        }
        return { color: "inherit", fontWeight: 400 };
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      cellStyle: (params) => {
        const base: Record<string, string> = {
          padding: "2px 8px",
          borderRadius: "4px",
          display: "inline-block",
        };
        switch (params.value) {
          case "Active":
            return {
              ...base,
              backgroundColor: "rgba(5, 150, 105, 0.2)",
              color: "#059669",
            };
          case "Pending":
            return {
              ...base,
              backgroundColor: "rgba(217, 119, 6, 0.2)",
              color: "#d97706",
            };
          case "Inactive":
            return {
              ...base,
              backgroundColor: "rgba(220, 38, 38, 0.2)",
              color: "#dc2626",
            };
          default:
            return base;
        }
      },
    },
  ]);

  const [data] = useState<StockRow[]>(() =>
    SAMPLE_DATA.map((row) => ({ ...row }))
  );

  return (
    <DemoLayout
      title="16 - Cell Renderers (cellStyle)"
      description="Custom cell styling using cellStyle functions and objects. Different columns demonstrate static styles, conditional value-based styles, and badge-like rendering."
    >
      <div className="grid grid-cols-3 gap-3 mb-4">
        {STYLE_EXAMPLES.map((example) => (
          <div
            key={example.label}
            className="p-3 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1"
          >
            <span className={`text-sm font-semibold ${example.color}`}>
              {example.label}
            </span>
            <p className="text-xs text-ctp-subtext0 mt-1">
              {example.description}
            </p>
          </div>
        ))}
      </div>

      <div style={{ height: "50vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={data}
          columnDefs={columns}
          getRowId={(params) => params.data.id}
        />
      </div>

      <div className="mt-4 p-4 rounded-lg bg-ctp-mantle border border-ctp-surface1">
        <h3 className="text-sm font-semibold text-ctp-text mb-2">
          cellStyle Definitions
        </h3>
        <pre className="text-xs text-ctp-subtext0 overflow-x-auto">
{`// Static style object
cellStyle: { color: "#2563eb", cursor: "pointer", fontWeight: 600 }

// Conditional style function
cellStyle: (params) => {
  if (params.value > 0) return { color: "#059669" };
  if (params.value < 0) return { color: "#dc2626" };
  return {};
}

// Badge-style with background
cellStyle: (params) => ({
  backgroundColor: "rgba(5, 150, 105, 0.2)",
  color: "#059669",
  padding: "2px 8px",
  borderRadius: "4px",
})`}
        </pre>
      </div>
    </DemoLayout>
  );
}
