"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme, defaultColDef } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import { generatePerfData } from "@/lib/data";
import type { StockRow } from "@/lib/types";

const ROW_COUNTS = [100, 500, 1000, 5000, 10000];

const PERF_COLUMNS: ColDef<StockRow>[] = [
  { field: "id", headerName: "Index", width: 120 },
  { field: "symbol", headerName: "Symbol", width: 100 },
  { field: "sector", headerName: "Sector", width: 120 },
  { field: "price", headerName: "Price", width: 110 },
  { field: "qty", headerName: "Quantity", width: 110 },
  { field: "change", headerName: "Change %", width: 110 },
];

export default function Demo18Page() {
  const nextIdRef = useRef(0);
  const dataRef = useRef<StockRow[]>([]);
  const statsRef = useRef({ updateCount: 0, rowsAdded: 0, rowsDeleted: 0, cellsUpdated: 0 });

  const [rowCount, setRowCount] = useState(1000);
  const [data, setData] = useState<StockRow[]>(() => {
    const d = generatePerfData(1000);
    nextIdRef.current = d.length;
    dataRef.current = d;
    return d;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    updateCount: 0,
    rowsAdded: 0,
    rowsDeleted: 0,
    cellsUpdated: 0,
  });

  const handleGenerate = useCallback(() => {
    const d = generatePerfData(rowCount);
    nextIdRef.current = d.length;
    dataRef.current = d;
    setData(d);
    statsRef.current = { updateCount: 0, rowsAdded: 0, rowsDeleted: 0, cellsUpdated: 0 };
    setStats(statsRef.current);
    setIsRunning(false);
  }, [rowCount]);

  const handleClear = useCallback(() => {
    dataRef.current = [];
    setData([]);
    nextIdRef.current = 0;
    statsRef.current = { updateCount: 0, rowsAdded: 0, rowsDeleted: 0, cellsUpdated: 0 };
    setStats(statsRef.current);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const current = dataRef.current;
      const next = current.map((row) => ({ ...row }));
      let cellsThisTick = 0;
      let addedThisTick = 0;
      let deletedThisTick = 0;

      // UPDATE: modify 10-50 random rows
      const updateCount = Math.floor(Math.random() * 41) + 10;
      for (let i = 0; i < Math.min(updateCount, next.length); i++) {
        const idx = Math.floor(Math.random() * next.length);
        const delta = Math.round((Math.random() * 10 - 5) * 100) / 100;
        next[idx] = {
          ...next[idx],
          price: Math.max(0.01, Math.round((next[idx].price + delta) * 100) / 100),
          change: Math.round(delta * 100) / 100,
        };
        cellsThisTick += 2;
      }

      // CREATE: 10% chance, add 1-3 rows
      if (Math.random() < 0.1) {
        const count = Math.floor(Math.random() * 3) + 1;
        const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "META", "TSLA", "NVDA"];
        const sectors = ["Technology", "Finance", "Healthcare", "Energy"];
        for (let i = 0; i < count; i++) {
          next.push({
            id: `perf_${nextIdRef.current++}`,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            company: `Company ${nextIdRef.current}`,
            sector: sectors[Math.floor(Math.random() * sectors.length)],
            price: Math.round((50 + Math.random() * 400) * 100) / 100,
            qty: Math.floor(Math.random() * 1000) + 1,
            change: Math.round((Math.random() * 20 - 10) * 100) / 100,
            active: true,
            status: "Active",
          });
          addedThisTick++;
        }
      }

      // DELETE: 5% chance, remove 1-2 rows (min 100 rows)
      if (Math.random() < 0.05 && next.length > 100) {
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count && next.length > 100; i++) {
          const idx = Math.floor(Math.random() * next.length);
          next.splice(idx, 1);
          deletedThisTick++;
        }
      }

      dataRef.current = next;
      statsRef.current = {
        updateCount: statsRef.current.updateCount + 1,
        rowsAdded: statsRef.current.rowsAdded + addedThisTick,
        rowsDeleted: statsRef.current.rowsDeleted + deletedThisTick,
        cellsUpdated: statsRef.current.cellsUpdated + cellsThisTick,
      };

      setData(next);
      setStats({ ...statsRef.current });
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <DemoLayout
      title="18 - Performance Testing"
      description="Large dataset stress test with continuous CRUD operations. Generate thousands of rows and run rapid create/update/delete cycles to test AG Grid rendering performance."
    >
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={rowCount}
          onChange={(e) => setRowCount(Number(e.target.value))}
          className="px-3 py-2 rounded-lg bg-ctp-surface0 text-ctp-text border border-ctp-surface1 text-sm"
        >
          {ROW_COUNTS.map((count) => (
            <option key={count} value={count}>
              {count.toLocaleString()} rows
            </option>
          ))}
        </select>
        <button
          onClick={handleGenerate}
          className="px-4 py-2 rounded-lg bg-ctp-blue/20 text-ctp-blue border border-ctp-blue/30 text-sm font-medium hover:bg-ctp-blue/30 transition-colors"
        >
          Generate Data
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-lg bg-ctp-overlay0/20 text-ctp-overlay0 border border-ctp-overlay0/30 text-sm font-medium hover:bg-ctp-overlay0/30 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={() => setIsRunning((prev) => !prev)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            isRunning
              ? "bg-ctp-red/20 text-ctp-red border-ctp-red/30 hover:bg-ctp-red/30"
              : "bg-ctp-green/20 text-ctp-green border-ctp-green/30 hover:bg-ctp-green/30"
          }`}
        >
          {isRunning ? "Stop CRUD" : "Start CRUD"}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-ctp-blue/20 text-ctp-blue border-ctp-blue/30">
          Rows: {data.length.toLocaleString()}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-ctp-mauve/20 text-ctp-mauve border-ctp-mauve/30">
          Cycles: {stats.updateCount.toLocaleString()}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-ctp-green/20 text-ctp-green border-ctp-green/30">
          Added: {stats.rowsAdded.toLocaleString()}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-ctp-red/20 text-ctp-red border-ctp-red/30">
          Deleted: {stats.rowsDeleted.toLocaleString()}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-ctp-peach/20 text-ctp-peach border-ctp-peach/30">
          Cells Updated: {stats.cellsUpdated.toLocaleString()}
        </span>
      </div>

      <div style={{ height: "50vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
            defaultColDef={defaultColDef}
          rowData={data}
          columnDefs={PERF_COLUMNS}
          getRowId={(params) => params.data.id}
        />
      </div>
    </DemoLayout>
  );
}
