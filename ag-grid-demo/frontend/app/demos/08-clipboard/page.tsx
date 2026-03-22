"use client";

import { useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import { CLIPBOARD_DATA } from "@/lib/data";

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}tn`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}bn`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}m`;
  return `$${value}`;
}

export default function Demo08Page() {
  const gridRef = useRef<AgGridReact>(null);

  const [columns] = useState<ColDef[]>([
    { field: "symbol", headerName: "Symbol", width: 100 },
    { field: "company", headerName: "Company", flex: 1 },
    { field: "sector", headerName: "Sector", width: 120 },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      valueFormatter: (params) =>
        params.value != null ? `$${params.value.toFixed(2)}` : "",
    },
    {
      field: "market_cap",
      headerName: "Market Cap",
      width: 140,
      valueFormatter: (params) =>
        params.value != null ? formatMarketCap(params.value) : "",
    },
    {
      field: "change",
      headerName: "Change %",
      width: 120,
      valueFormatter: (params) =>
        params.value != null ? `${params.value.toFixed(2)}%` : "",
    },
  ]);

  const onGridReady = useCallback((event: GridReadyEvent) => {
    event.api.setGridOption("processCellForClipboard", (params) => {
      return params.value;
    });
  }, []);

  return (
    <DemoLayout
      title="08 - Clipboard"
      description="Cells display formatted values (currency, abbreviations, percentages) but copy raw numeric values to the clipboard. Select cells and press Ctrl+C to test."
    >
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-ctp-blue/20 text-ctp-blue border border-ctp-blue/30">
          Currency Display
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-ctp-green/20 text-ctp-green border border-ctp-green/30">
          Abbreviations
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-ctp-peach/20 text-ctp-peach border border-ctp-peach/30">
          Raw Copy
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-ctp-mauve/20 text-ctp-mauve border border-ctp-mauve/30">
          Ctrl+C
        </span>
      </div>

      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1 mb-4">
        <span className="text-ctp-peach text-sm mt-0.5">Info:</span>
        <div className="text-xs text-ctp-subtext0 space-y-1">
          <p>
            <span className="text-ctp-text font-mono">$175.50</span>{" "}
            <span className="text-ctp-overlay0">&rarr;</span> clipboard:{" "}
            <span className="text-ctp-green font-mono">175.5</span>
          </p>
          <p>
            <span className="text-ctp-text font-mono">$2.8tn</span>{" "}
            <span className="text-ctp-overlay0">&rarr;</span> clipboard:{" "}
            <span className="text-ctp-green font-mono">2800000000000</span>
          </p>
          <p>
            <span className="text-ctp-text font-mono">2.50%</span>{" "}
            <span className="text-ctp-overlay0">&rarr;</span> clipboard:{" "}
            <span className="text-ctp-green font-mono">2.5</span>
          </p>
        </div>
      </div>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          theme={gridTheme}
          rowData={CLIPBOARD_DATA}
          columnDefs={columns}
          cellSelection={true}
          rowSelection={{ mode: "multiRow" }}
          onGridReady={onGridReady}
        />
      </div>
    </DemoLayout>
  );
}
