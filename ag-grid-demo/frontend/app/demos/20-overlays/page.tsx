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

export default function Demo20Page() {
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const [data, setData] = useState<StockRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(() => {
    // Cancel any pending load
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      setData(SAMPLE_DATA.slice(0, 3).map((row) => ({ ...row })));
      setIsLoading(false);
      timerRef.current = null;
    }, 2000);
  }, []);

  const clearData = useCallback(() => {
    // Cancel any pending load
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setData([]);
    setIsLoading(false);
  }, []);

  const badgeText = isLoading
    ? "Loading..."
    : data.length > 0
      ? `${data.length} rows`
      : "No data";

  return (
    <DemoLayout
      title="20 - Overlays"
      description="Loading and no-rows overlays. The grid displays a loading overlay while data is being fetched, and a no-rows overlay when there is no data to display."
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-lg bg-ctp-green/20 text-ctp-green border border-ctp-green/30 text-sm font-medium hover:bg-ctp-green/30 transition-colors"
        >
          Load Data
        </button>
        <button
          onClick={clearData}
          className="px-4 py-2 rounded-lg bg-ctp-overlay0/20 text-ctp-subtext0 border border-ctp-overlay0/30 text-sm font-medium hover:bg-ctp-overlay0/30 transition-colors"
        >
          Clear
        </button>
        <StatusBadge lastEvent={badgeText} />
      </div>

      <div style={{ height: "50vh", width: "100%" }}>
        <AgGridReact<StockRow>
          theme={gridTheme}
          rowData={data}
          columnDefs={columns}
          loading={isLoading}
          overlayLoadingTemplate='<span style="padding: 20px;">Loading data...</span>'
          overlayNoRowsTemplate='<span style="padding: 20px;">No rows to display. Click Load Data to fetch records.</span>'
          getRowId={(params) => params.data.id}
        />
      </div>

      <pre className="mt-4 p-4 rounded-lg bg-ctp-surface0/50 border border-ctp-surface1 text-xs text-ctp-subtext0 overflow-x-auto">
{`loading={isLoading}
overlayLoadingTemplate='<span style="padding: 20px;">Loading data...</span>'
overlayNoRowsTemplate='<span style="padding: 20px;">No rows to display. Click Load Data to fetch records.</span>'`}
      </pre>
    </DemoLayout>
  );
}
