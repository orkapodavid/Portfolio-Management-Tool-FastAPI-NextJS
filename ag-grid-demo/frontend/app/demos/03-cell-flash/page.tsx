"use client";

import { useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme, defaultColDef } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA, simulatePriceTick } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

export default function Demo03Page() {
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const dataRef = useRef<StockRow[]>(SAMPLE_DATA.map((row) => ({ ...row })));
  const [data, setData] = useState<StockRow[]>(dataRef.current);
  const [lastEvent, setLastEvent] = useState("Paused - click Update Price");

  const updatePrice = useCallback(() => {
    const { updatedRows, idx } = simulatePriceTick(dataRef.current);
    dataRef.current = updatedRows;
    const row = updatedRows[idx];
    setData(updatedRows);
    setLastEvent(
      `Updated ${row.symbol}: price=${row.price}, change=${row.change}`
    );
  }, []);

  return (
    <DemoLayout
      title="03 - Cell Flash"
      description="Cells flash briefly when their values change, providing a visual indicator of updates. Click the button below to randomly update a stock price."
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={updatePrice}
          className="px-4 py-2 rounded-lg bg-ctp-green/20 text-ctp-green border border-ctp-green/30 text-sm font-medium hover:bg-ctp-green/30 transition-colors"
        >
          Update Price
        </button>
        <StatusBadge lastEvent={lastEvent} />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1 mb-4">
        <span className="text-ctp-peach text-sm">Note:</span>
        <span className="text-xs text-ctp-subtext0">
          Cell flashing requires CSS animation support. Cells briefly highlight green (up) or red (down) when values change.
        </span>
      </div>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
            defaultColDef={defaultColDef}
          rowData={data}
          columnDefs={columns}
          getRowId={(params) => params.data.id}
        />
      </div>
    </DemoLayout>
  );
}
