"use client";

import { useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme, defaultColDef } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import NotificationPanel from "@/components/notification-panel";
import { SAMPLE_DATA, simulatePriceTick } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow, Notification } from "@/lib/types";

export default function Demo06Page() {
  const gridRef = useRef<AgGridReact<StockRow>>(null);
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const dataRef = useRef<StockRow[]>(SAMPLE_DATA.map((row) => ({ ...row })));
  const [data, setData] = useState<StockRow[]>(dataRef.current);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifIdRef = useRef(0);

  const generateNotification = useCallback(() => {
    const { updatedRows, idx } = simulatePriceTick(dataRef.current);
    dataRef.current = updatedRows;
    const row = updatedRows[idx];
    setData(updatedRows);

    if (Math.abs(row.change) > 3) {
      const level: Notification["level"] =
        row.change > 0 ? "success" : "error";
      const newNotif: Notification = {
        id: ++notifIdRef.current,
        message: `${row.symbol} moved ${row.change > 0 ? "+" : ""}${row.change}%`,
        rowId: row.id,
        level,
      };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 5));
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const jumpToRow = useCallback((rowId: string) => {
    const api = gridRef.current?.api;
    if (!api) return;
    const rowNode = api.getRowNode(rowId);
    if (!rowNode) return;
    api.ensureNodeVisible(rowNode);
    api.flashCells({ rowNodes: [rowNode] });
  }, []);

  return (
    <DemoLayout
      title="06 - Notifications"
      description="Price updates that exceed a threshold generate notifications. Click a notification to jump to and highlight that row in the grid."
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={generateNotification}
          className="px-4 py-2 rounded-lg bg-ctp-blue/20 text-ctp-blue border border-ctp-blue/30 text-sm font-medium hover:bg-ctp-blue/30 transition-colors"
        >
          Generate Notification
        </button>
        <button
          onClick={clearNotifications}
          className="px-4 py-2 rounded-lg bg-ctp-surface0 text-ctp-subtext0 border border-ctp-surface1 text-sm font-medium hover:text-ctp-text transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="flex gap-4">
        <div style={{ width: "60vw", height: "60vh" }}>
          <AgGridReact<StockRow>
            ref={gridRef}
            theme={gridTheme}
            defaultColDef={defaultColDef}
            rowData={data}
            columnDefs={columns}
            getRowId={(params) => params.data.id}
          />
        </div>
        <NotificationPanel
          notifications={notifications}
          onClear={clearNotifications}
          onJumpToRow={jumpToRow}
        />
      </div>
    </DemoLayout>
  );
}
