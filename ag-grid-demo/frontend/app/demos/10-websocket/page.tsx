"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme, defaultColDef } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import NotificationPanel from "@/components/notification-panel";
import { SAMPLE_DATA, simulatePriceTick, API_BASE } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow, Notification } from "@/lib/types";

const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws/stream";

export default function Demo10PageWrapper() {
  return (
    <Suspense>
      <Demo10Page />
    </Suspense>
  );
}

function Demo10Page() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const gridRef = useRef<AgGridReact<StockRow>>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const dataRef = useRef<StockRow[]>(SAMPLE_DATA.map((row) => ({ ...row })));
  const [columns] = useState<ColDef[]>(getBasicColumns);
  const [data, setData] = useState<StockRow[]>(dataRef.current);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastEvent, setLastEvent] = useState("Stopped");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifIdRef = useRef(0);
  const [useWs, setUseWs] = useState(true);

  const addNotification = useCallback(
    (message: string, rowId: string, level: Notification["level"]) => {
      const notif: Notification = {
        id: notifIdRef.current++,
        message,
        rowId,
        level,
      };
      setNotifications((prev) => [notif, ...prev].slice(0, 5));
    },
    []
  );

  // Apply an update from either WebSocket or local tick
  const applyUpdate = useCallback(
    (update: { id: string; symbol: string; price: number; change: number }) => {
      dataRef.current = dataRef.current.map((row) =>
        row.id === update.id
          ? { ...row, price: update.price, change: update.change }
          : row
      );
      setData([...dataRef.current]);
      setLastEvent(
        `Updated ${update.symbol}: price=${update.price}, change=${update.change}`
      );
      if (Math.abs(update.change) > 3) {
        addNotification(
          `${update.symbol} moved ${update.change > 0 ? "+" : ""}${update.change}%`,
          update.id,
          update.change > 0 ? "success" : "warning"
        );
      }
    },
    [addNotification]
  );

  // WebSocket streaming
  useEffect(() => {
    if (!isStreaming || !useWs) return;

    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const update = JSON.parse(event.data);
        applyUpdate(update);
      };

      ws.onerror = () => {
        setUseWs(false);
      };

      ws.onclose = () => {
        wsRef.current = null;
        // If streaming is still active and we didn't intentionally close,
        // fall back to local simulation
        setUseWs(false);
      };
    } catch {
      setUseWs(false);
      return;
    }

    return () => {
      // Prevent onclose from triggering fallback during intentional cleanup
      ws.onclose = null;
      ws.close();
      wsRef.current = null;
    };
  }, [isStreaming, useWs, applyUpdate]);

  // Fallback: local interval when WebSocket unavailable
  useEffect(() => {
    if (!isStreaming || useWs) return;

    const interval = setInterval(() => {
      const { updatedRows, idx } = simulatePriceTick(dataRef.current);
      dataRef.current = updatedRows;
      const row = updatedRows[idx];
      setData(updatedRows);
      setLastEvent(
        `Updated ${row.symbol}: price=${row.price}, change=${row.change}`
      );
      if (Math.abs(row.change) > 3) {
        addNotification(
          `${row.symbol} moved ${row.change > 0 ? "+" : ""}${row.change}%`,
          row.id,
          row.change > 0 ? "success" : "warning"
        );
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming, useWs, addNotification]);

  const handleManualUpdate = useCallback(() => {
    const { updatedRows, idx } = simulatePriceTick(dataRef.current);
    dataRef.current = updatedRows;
    const row = updatedRows[idx];
    setData(updatedRows);
    setLastEvent(
      `Manual: ${row.symbol} price=${row.price}, change=${row.change}`
    );
    if (Math.abs(row.change) > 3) {
      addNotification(
        `${row.symbol} moved ${row.change > 0 ? "+" : ""}${row.change}%`,
        row.id,
        row.change > 0 ? "success" : "warning"
      );
    }
  }, [addNotification]);

  const toggleStreaming = useCallback(() => {
    const next = !isStreaming;
    setIsStreaming(next);
    setLastEvent(next ? "Streaming started" : "Stopped");
    if (!next && wsRef.current) {
      wsRef.current.onclose = null; // prevent fallback trigger
      wsRef.current.close();
      wsRef.current = null;
    }
    if (next) {
      setUseWs(true);
    }
  }, [isStreaming]);

  const onGridReady = useCallback(
    (event: GridReadyEvent) => {
      if (highlightId) {
        const rowNode = event.api.getRowNode(highlightId);
        if (rowNode) {
          event.api.ensureNodeVisible(rowNode);
          event.api.flashCells({ rowNodes: [rowNode] });
        }
      }
    },
    [highlightId]
  );

  const handleJumpToRow = useCallback((rowId: string) => {
    const api = gridRef.current?.api;
    if (!api) return;
    const rowNode = api.getRowNode(rowId);
    if (rowNode) {
      api.ensureNodeVisible(rowNode);
      api.flashCells({ rowNodes: [rowNode] });
    }
  }, []);

  return (
    <DemoLayout
      title="10 - WebSocket Streaming"
      description="Real-time streaming price updates via WebSocket (falls back to local simulation if backend is unavailable). Prices update every 2 seconds when streaming is active. Large moves trigger notifications."
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={toggleStreaming}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            isStreaming
              ? "bg-ctp-red/20 text-ctp-red border-ctp-red/30 hover:bg-ctp-red/30"
              : "bg-ctp-green/20 text-ctp-green border-ctp-green/30 hover:bg-ctp-green/30"
          }`}
        >
          {isStreaming ? "Stop Streaming" : "Start Streaming"}
        </button>
        <button
          onClick={handleManualUpdate}
          className="px-4 py-2 rounded-lg bg-ctp-blue/20 text-ctp-blue border border-ctp-blue/30 text-sm font-medium hover:bg-ctp-blue/30 transition-colors"
        >
          Manual Update
        </button>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
            isStreaming
              ? "bg-ctp-green/20 text-ctp-green border-ctp-green/30"
              : "bg-ctp-overlay0/20 text-ctp-overlay0 border-ctp-overlay0/30"
          }`}
        >
          {isStreaming ? "LIVE" : "STOPPED"}
        </span>
        {isStreaming && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${
              useWs
                ? "bg-ctp-teal/20 text-ctp-teal border-ctp-teal/30"
                : "bg-ctp-yellow/20 text-ctp-yellow border-ctp-yellow/30"
            }`}
          >
            {useWs ? "WebSocket" : "Local fallback"}
          </span>
        )}
        <StatusBadge lastEvent={lastEvent} />
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
            onGridReady={onGridReady}
          />
        </div>
        <NotificationPanel
          notifications={notifications}
          onClear={() => setNotifications([])}
          onJumpToRow={handleJumpToRow}
        />
      </div>
    </DemoLayout>
  );
}
