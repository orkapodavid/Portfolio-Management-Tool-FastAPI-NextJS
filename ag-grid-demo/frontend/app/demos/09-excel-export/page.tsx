"use client";

import { useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

export default function Demo09Page() {
  const gridRef = useRef<AgGridReact<StockRow>>(null);
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const [lastEvent, setLastEvent] = useState("Ready to export");

  const exportExcel = useCallback(() => {
    gridRef.current?.api.exportDataAsExcel();
    setLastEvent("Exported as Excel (.xlsx)");
  }, []);

  const exportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv();
    setLastEvent("Exported as CSV");
  }, []);

  const exportSelected = useCallback(() => {
    const selectedRows = gridRef.current?.api.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
      setLastEvent("No rows selected - select rows first");
      return;
    }
    gridRef.current?.api.exportDataAsCsv({ onlySelected: true });
    setLastEvent(`Exported ${selectedRows.length} selected row(s) as CSV`);
  }, []);

  return (
    <DemoLayout
      title="09 - Excel Export"
      description="Export grid data to Excel or CSV format. Select rows and use the export buttons below. Excel export requires an AG Grid Enterprise license."
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={exportExcel}
          className="px-4 py-2 rounded-lg bg-ctp-green/20 text-ctp-green border border-ctp-green/30 text-sm font-medium hover:bg-ctp-green/30 transition-colors"
        >
          Export Excel
        </button>
        <button
          onClick={exportCsv}
          className="px-4 py-2 rounded-lg bg-ctp-blue/20 text-ctp-blue border border-ctp-blue/30 text-sm font-medium hover:bg-ctp-blue/30 transition-colors"
        >
          Export CSV
        </button>
        <button
          onClick={exportSelected}
          className="px-4 py-2 rounded-lg bg-ctp-mauve/20 text-ctp-mauve border border-ctp-mauve/30 text-sm font-medium hover:bg-ctp-mauve/30 transition-colors"
        >
          Export Selected
        </button>
        <StatusBadge lastEvent={lastEvent} />
      </div>

      <p className="text-xs text-ctp-overlay0 mb-4">
        Excel export (.xlsx) requires AG Grid Enterprise. CSV export is available in the Community edition.
      </p>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact<StockRow>
          ref={gridRef}
          theme={gridTheme}
          rowData={SAMPLE_DATA}
          columnDefs={columns}
          rowSelection={{ mode: "multiRow" }}
        />
      </div>
    </DemoLayout>
  );
}
