"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GridReadyEvent,
} from "ag-grid-community";
import { RefreshCw, Search } from "lucide-react";

import { cn } from "@/lib/utils";

ModuleRegistry.registerModules([AllCommunityModule]);

const pmtTheme = themeQuartz.withParams({
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  headerFontSize: 11,
  fontSize: 11,
  rowHeight: 28,
  headerHeight: 32,
  borderColor: "#e5e7eb",
  oddRowBackgroundColor: "#fafafa",
  cellHorizontalPadding: 8,
});

const DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
  floatingFilter: true,
  flex: 1,
};

type DataGridProps<TRow> = {
  columns: ColDef[];
  rows: TRow[];
  isLoading?: boolean;
  errorMessage?: string | null;
  emptyMessage?: string;
  onRefresh?: () => void | Promise<void>;
  searchPlaceholder?: string;
  className?: string;
  rowIdKey?: string;
  /** Additional toolbar content rendered before the search input. */
  toolbarStart?: React.ReactNode;
  /** Additional toolbar content rendered after the refresh button. */
  toolbarEnd?: React.ReactNode;
};

export function DataGrid<TRow extends Record<string, unknown>>({
  columns,
  rows,
  isLoading = false,
  errorMessage = null,
  emptyMessage = "No data available.",
  onRefresh,
  searchPlaceholder = "Search…",
  className,
  rowIdKey = "id",
  toolbarStart,
  toolbarEnd,
}: DataGridProps<TRow>) {
  const [searchValue, setSearchValue] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const gridApiRef = useRef<GridReadyEvent["api"] | null>(null);

  useEffect(() => {
    gridApiRef.current?.setGridOption("quickFilterText", searchValue);
  }, [searchValue]);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const onGridReady = (event: GridReadyEvent) => {
    gridApiRef.current = event.api;
  };

  const getRowId = useMemo(
    () => (params: { data: TRow }) =>
      String((params.data as Record<string, unknown>)[rowIdKey] ?? ""),
    [rowIdKey]
  );

  return (
    <div className={cn("flex flex-col h-full min-h-0 w-full bg-white", className)}>
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#F9F9F9] border-b border-gray-200 shrink-0 h-[40px]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {toolbarStart}
          <button
            type="button"
            aria-label="Refresh"
            onClick={() => {
              void handleRefresh();
            }}
            disabled={!onRefresh || isRefreshing}
            className="h-6 w-6 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded hover:bg-gray-50 hover:text-blue-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={12}
              className={cn(isRefreshing ? "animate-spin" : undefined)}
            />
          </button>
          <div className="flex items-center bg-white border border-gray-200 rounded px-2 h-6 flex-1 max-w-[200px] shadow-sm">
            <Search size={12} className="text-gray-400 mr-1.5 shrink-0" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={searchPlaceholder}
              className="bg-transparent text-[10px] font-bold outline-none w-full text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">{toolbarEnd}</div>
      </div>
      {errorMessage ? (
        <div className="m-3 rounded border border-red-500/40 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <AgGridReact
            theme={pmtTheme}
            columnDefs={columns}
            rowData={rows}
            defaultColDef={DEFAULT_COL_DEF}
            getRowId={getRowId}
            onGridReady={onGridReady}
            loading={isLoading}
            overlayNoRowsTemplate={`<span style="padding: 10px; color: #6b7280;">${emptyMessage}</span>`}
            animateRows
          />
        </div>
      )}
    </div>
  );
}
