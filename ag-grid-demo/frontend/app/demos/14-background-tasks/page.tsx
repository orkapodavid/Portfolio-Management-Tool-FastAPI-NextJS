"use client";

import { useState, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme, defaultColDef } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { SAMPLE_DATA, simulatePriceTick } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

export default function Demo14Page() {
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const dataRef = useRef<StockRow[]>(SAMPLE_DATA.map((row) => ({ ...row })));
  const [data, setData] = useState<StockRow[]>(dataRef.current);
  const [isRunning, setIsRunning] = useState(false);
  const [lastEvent, setLastEvent] = useState("Stopped");

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const { updatedRows, idx } = simulatePriceTick(dataRef.current);
      dataRef.current = updatedRows;
      const row = updatedRows[idx];
      setData(updatedRows);
      setLastEvent(
        `Updated ${row.symbol}: price=${row.price}, change=${row.change}`
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleToggle = () => {
    const next = !isRunning;
    setIsRunning(next);
    setLastEvent(next ? "Running" : "Stopped");
  };

  return (
    <DemoLayout
      title="14 - Background Tasks"
      description="Scheduled background updates that randomly modify stock prices every 2 seconds. Start the task to watch prices update automatically with cell flash animations."
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            isRunning
              ? "bg-ctp-red/20 text-ctp-red border-ctp-red/30 hover:bg-ctp-red/30"
              : "bg-ctp-green/20 text-ctp-green border-ctp-green/30 hover:bg-ctp-green/30"
          }`}
        >
          {isRunning ? "Stop" : "Start"}
        </button>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-ctp-surface0/50 text-ctp-subtext0 border-ctp-surface1">
          Interval: 2 seconds
        </span>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
            isRunning
              ? "bg-ctp-green/20 text-ctp-green border-ctp-green/30"
              : "bg-ctp-overlay0/20 text-ctp-overlay0 border-ctp-overlay0/30"
          }`}
        >
          {isRunning ? "RUNNING" : "STOPPED"}
        </span>

        <StatusBadge lastEvent={lastEvent} />
      </div>

      <div style={{ height: "55vh", width: "100%" }}>
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
