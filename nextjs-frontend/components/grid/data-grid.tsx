"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GetContextMenuItems,
  type GridReadyEvent,
  type RowSelectionOptions,
  type StatusPanelDef,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import {
  CalendarDays,
  ChevronDown,
  Clock,
  FileSpreadsheet,
  RefreshCw,
  RotateCcw,
  Rows3,
  Save,
  Search,
  X,
  Zap,
} from "lucide-react";

import { useGridRegistry, type GridApiLike } from "@/lib/grid-registry";
import { cn } from "@/lib/utils";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

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

const STANDARD_STATUS_BAR: { statusPanels: StatusPanelDef[] } = {
  statusPanels: [
    { statusPanel: "agTotalRowCountComponent", align: "left" },
    { statusPanel: "agFilteredRowCountComponent", align: "left" },
    { statusPanel: "agSelectedRowCountComponent", align: "center" },
    { statusPanel: "agAggregationComponent", align: "right" },
  ],
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
  /** Show the four-panel status bar at the bottom (default true). */
  showStatusBar?: boolean;
  /** Enable click-and-drag cell range selection (default true). */
  enableRangeSelection?: boolean;
  /** Flash cells when their value changes — for real-time grids. */
  enableCellFlash?: boolean;
  /** Show an auto-numbered row column on the left. */
  showRowNumbers?: boolean;
  /** Multi-row selection with checkboxes. */
  enableMultiSelect?: boolean;
  /** Show the row-group drop zone above the grid. */
  showRowGroupPanel?: boolean;
  /** Initial expansion depth for grouped rows (-1 expands all). */
  groupDefaultExpanded?: number;
  /** Custom context-menu builder; receives params from AG Grid. */
  getContextMenuItems?: GetContextMenuItems;
  /** Identifier used for export filename + state-persistence storage key. */
  gridId?: string;
  /** Override the export filename prefix (defaults to gridId without `_grid`). */
  exportPrefix?: string;
  /** Hide the Excel-export button in the toolbar (default visible when gridId set). */
  hideExcelExport?: boolean;
  /** Hide the Save/Restore/Reset layout buttons (default visible when gridId set). */
  hideLayoutButtons?: boolean;
  /** Show the Compact mode toggle button. */
  showCompactToggle?: boolean;
  /** Show the Last-Updated / Auto-Refresh status row above the toolbar. */
  showAutoRefresh?: boolean;
  /** Start with the Auto-Refresh switch off when showAutoRefresh is true. */
  defaultAutoRefreshOff?: boolean;
  /**
   * Polling interval in milliseconds when auto-refresh is on. Defaults to
   * 30 s — except when `simulateUpdate` is set, in which case it defaults to
   * `simulateUpdateIntervalMs` so simulator and backend cadence stay
   * aligned with Reflex (no "snap-back" once per 30 s).
   */
  autoRefreshIntervalMs?: number;
  /** Optional client-side row drift between backend refreshes. */
  simulateUpdate?: (rows: TRow[]) => TRow[];
  /** Simulation interval in milliseconds when simulateUpdate is set (default 2s). */
  simulateUpdateIntervalMs?: number;
  /** Items to render in a Generate dropdown placed first in the toolbar. */
  generateItems?: string[];
  /** Handler invoked with the chosen Generate item label. */
  onGenerate?: (item: string) => void;
  /** Show a single-date picker in the toolbar (controlled). */
  toolbarDate?: string;
  /** Handler called when the toolbar date input changes. */
  onToolbarDateChange?: (value: string) => void;
  /** Optional page-specific filter strip rendered between the toolbar and grid. */
  filterBar?: React.ReactNode;
};

const COMPACT_ROW_HEIGHT = 28;
const COMPACT_HEADER_HEIGHT = 32;
const NORMAL_ROW_HEIGHT = 42;
const NORMAL_HEADER_HEIGHT = 48;

const STORAGE_PREFIX = "pmt:next:";
const SEARCH_DEBOUNCE_MS = 300;

type SavedGridState = Record<string, unknown> & {
  columnSizing?: {
    columnSizingModel?: Array<Record<string, unknown>>;
  };
};

const stripFlexFromColumns = (state: SavedGridState): SavedGridState => {
  const sizing = state.columnSizing?.columnSizingModel;
  if (Array.isArray(sizing)) {
    state.columnSizing!.columnSizingModel = sizing.map((col) => {
      const next = { ...col };
      delete next.flex;
      return next;
    });
  }
  return state;
};

export function DataGrid<TRow extends Record<string, unknown>>({
  columns,
  rows,
  isLoading = false,
  errorMessage = null,
  emptyMessage = "No rows to display",
  onRefresh,
  searchPlaceholder = "Search all columns...",
  className,
  rowIdKey = "id",
  toolbarStart,
  toolbarEnd,
  showStatusBar = true,
  enableRangeSelection = true,
  enableCellFlash = false,
  showRowNumbers = false,
  enableMultiSelect = false,
  showRowGroupPanel = false,
  groupDefaultExpanded,
  getContextMenuItems,
  gridId,
  exportPrefix,
  hideExcelExport = false,
  hideLayoutButtons = false,
  showCompactToggle = false,
  showAutoRefresh = false,
  defaultAutoRefreshOff = false,
  autoRefreshIntervalMs,
  simulateUpdate,
  simulateUpdateIntervalMs = 2_000,
  generateItems,
  onGenerate,
  toolbarDate,
  onToolbarDateChange,
  filterBar,
}: DataGridProps<TRow>) {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [autoRefreshOn, setAutoRefreshOn] = useState(
    showAutoRefresh && !defaultAutoRefreshOff
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [displayRows, setDisplayRows] = useState(rows);
  const gridApiRef = useRef<GridReadyEvent["api"] | null>(null);
  const onRefreshRef = useRef(onRefresh);
  const simulateUpdateRef = useRef(simulateUpdate);
  const displayRowsRef = useRef(rows);
  const wasLoadingRef = useRef<boolean>(isLoading);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    simulateUpdateRef.current = simulateUpdate;
  }, [simulateUpdate]);

  useEffect(() => {
    displayRowsRef.current = rows;
    setDisplayRows(rows);
  }, [rows]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      gridApiRef.current?.setGridOption("quickFilterText", searchValue);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading && errorMessage === null) {
      setLastUpdated(new Date());
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, errorMessage]);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const effectiveAutoRefreshInterval =
    autoRefreshIntervalMs ?? (simulateUpdate ? simulateUpdateIntervalMs : 30_000);

  useEffect(() => {
    if (!showAutoRefresh || !autoRefreshOn) return;
    const id = window.setInterval(() => {
      const fn = onRefreshRef.current;
      if (!fn) return;
      void Promise.resolve(fn());
    }, effectiveAutoRefreshInterval);
    return () => window.clearInterval(id);
  }, [showAutoRefresh, autoRefreshOn, effectiveAutoRefreshInterval]);

  useEffect(() => {
    if (!showAutoRefresh || !autoRefreshOn || !simulateUpdate) return;
    const id = window.setInterval(() => {
      const currentRows = displayRowsRef.current;
      if (currentRows.length === 0) return;
      const nextRows = simulateUpdateRef.current?.(currentRows);
      if (!nextRows) return;
      displayRowsRef.current = nextRows;
      setDisplayRows(nextRows);
      setLastUpdated(new Date());
    }, simulateUpdateIntervalMs);
    return () => window.clearInterval(id);
  }, [showAutoRefresh, autoRefreshOn, simulateUpdate, simulateUpdateIntervalMs]);

  const storageKey = gridId ? `${STORAGE_PREFIX}${gridId}_state` : "";
  const showLayoutButtons = Boolean(gridId) && !hideLayoutButtons;

  const registry = useGridRegistry();
  const unregisterRef = useRef<(() => void) | null>(null);

  const onGridReady = (event: GridReadyEvent) => {
    gridApiRef.current = event.api;
    if (storageKey && typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const state = stripFlexFromColumns(JSON.parse(raw) as SavedGridState);
          event.api.setState(state as unknown as Parameters<typeof event.api.setState>[0]);
        }
      } catch {
        // Corrupt JSON or AG Grid version drift — ignore and let user re-save.
      }
    }
    if (gridId && registry) {
      unregisterRef.current?.();
      unregisterRef.current = registry.register(gridId, {
        api: event.api as unknown as GridApiLike,
        rowIdKey,
      });
    }
  };

  useEffect(
    () => () => {
      unregisterRef.current?.();
      unregisterRef.current = null;
    },
    []
  );

  const handleSaveLayout = () => {
    const api = gridApiRef.current;
    if (!api || !storageKey || typeof window === "undefined") return;
    try {
      const state = api.getState();
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Quota exceeded or serialization issue — fail silently rather than crash.
    }
  };

  const handleRestoreLayout = () => {
    const api = gridApiRef.current;
    if (!api || !storageKey || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const state = stripFlexFromColumns(JSON.parse(raw) as SavedGridState);
      api.setState(state as unknown as Parameters<typeof api.setState>[0]);
    } catch {
      // Ignore — bad JSON or AG Grid schema mismatch.
    }
  };

  const handleResetLayout = () => {
    const api = gridApiRef.current;
    if (!api) return;
    api.resetColumnState();
    api.setFilterModel(null);
    setSearchValue("");
    api.setGridOption("quickFilterText", "");
    if (storageKey && typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  };

  const handleCompactToggle = () => {
    const api = gridApiRef.current;
    if (!api) return;
    const next = !isCompact;
    setIsCompact(next);
    if (next) {
      api.setGridOption("rowHeight", COMPACT_ROW_HEIGHT);
      api.setGridOption("headerHeight", COMPACT_HEADER_HEIGHT);
      api.resetRowHeights();
      api.autoSizeAllColumns();
    } else {
      api.setGridOption("rowHeight", NORMAL_ROW_HEIGHT);
      api.setGridOption("headerHeight", NORMAL_HEADER_HEIGHT);
      api.resetRowHeights();
      api.sizeColumnsToFit();
    }
  };

  const effectiveRows = simulateUpdate ? displayRows : rows;

  const hasStableRowIds = useMemo(() => {
    if (effectiveRows.length === 0) return false;
    const first = effectiveRows[0] as Record<string, unknown>;
    const value = first?.[rowIdKey];
    return value !== undefined && value !== null && value !== "";
  }, [effectiveRows, rowIdKey]);

  const getRowId = useMemo(
    () =>
      hasStableRowIds
        ? (params: { data: TRow }) =>
            String((params.data as Record<string, unknown>)[rowIdKey])
        : undefined,
    [hasStableRowIds, rowIdKey]
  );

  const defaultColDef = useMemo<ColDef>(
    () =>
      enableCellFlash
        ? { ...DEFAULT_COL_DEF, enableCellChangeFlash: true }
        : DEFAULT_COL_DEF,
    [enableCellFlash]
  );

  const filenamePrefix = exportPrefix ?? (gridId ? gridId.replace(/_grid$/, "") : "");
  const showExcelButton = Boolean(gridId) && !hideExcelExport;

  const handleExportExcel = () => {
    const api = gridApiRef.current;
    if (!api) return;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const fileName = `${filenamePrefix || "export"}_${yyyy}${mm}${dd}_${hh}${min}`;
    const hasSelection = api.getSelectedRows().length > 0;
    api.exportDataAsExcel({
      fileName: `${fileName}.xlsx`,
      shouldRowBeSkipped: hasSelection
        ? (params) => !params.node.isSelected()
        : undefined,
    });
  };

  const cellSelection = enableRangeSelection ? true : undefined;
  const rowSelection = useMemo<RowSelectionOptions | undefined>(
    () =>
      enableMultiSelect
        ? { mode: "multiRow", checkboxes: true, headerCheckbox: true }
        : undefined,
    [enableMultiSelect]
  );
  const rowNumbers = showRowNumbers ? true : undefined;
  const rowGroupPanelShow = showRowGroupPanel ? "always" : undefined;
  const statusBar = showStatusBar ? STANDARD_STATUS_BAR : undefined;

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    <div className={cn("flex flex-col h-full min-h-0 w-full bg-white", className)}>
      {showAutoRefresh ? (
        <div className="flex items-center justify-between px-4 py-1.5 bg-gradient-to-r from-slate-50/95 via-white/90 to-slate-50/95 border-b border-slate-200/60 text-[11px] font-medium w-full shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="relative w-2 h-2 mr-2.5">
                {autoRefreshOn ? (
                  <>
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
                    <div className="relative w-2 h-2 bg-emerald-500 rounded-full" />
                  </>
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                )}
              </div>
              <Clock size={12} className="text-slate-400 mr-1.5" />
              <span className="text-slate-400 mr-1.5">Last Updated</span>
              <span className="font-mono font-semibold text-slate-600 bg-gradient-to-r from-slate-100 to-gray-100 px-2 py-0.5 rounded border border-slate-200/60">
                {formattedLastUpdated}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center bg-white/60 border border-slate-200/60 rounded-lg px-2.5 py-1 shadow-sm cursor-pointer">
              <span className="text-slate-500 font-medium mr-2.5 select-none">
                Auto Refresh
              </span>
              <input
                type="checkbox"
                checked={autoRefreshOn}
                onChange={(event) => setAutoRefreshOn(event.target.checked)}
                aria-label="Auto refresh"
                className="appearance-none w-7 h-4 rounded-full bg-gray-300 checked:bg-gradient-to-r checked:from-emerald-500 checked:to-teal-500 relative transition-colors cursor-pointer
                  before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-3 before:h-3 before:rounded-full before:bg-white before:transition-transform
                  checked:before:translate-x-3"
              />
            </label>
          </div>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#F9F9F9] border-b border-gray-200 shrink-0 h-[40px]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {generateItems && generateItems.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setGenerateOpen((prev) => !prev)}
                className="px-3 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded hover:shadow-md transition-all flex items-center shadow-sm"
              >
                <Zap size={12} />
                <span className="ml-1.5">Generate</span>
                <ChevronDown size={10} className="ml-1 opacity-70" />
              </button>
              {generateOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setGenerateOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                    {generateItems.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setGenerateOpen(false);
                          onGenerate?.(item);
                        }}
                        className="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
          {toolbarStart}
          {showExcelButton ? (
            <button
              type="button"
              onClick={handleExportExcel}
              title="Export visible rows (or selected rows) to a timestamped CSV"
              className="px-3 h-6 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gray-50 hover:text-green-600 transition-colors shadow-sm flex items-center"
            >
              <FileSpreadsheet size={12} />
              <span className="ml-1.5">Excel</span>
            </button>
          ) : null}
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
          <div className="flex items-center bg-white border border-gray-200 rounded px-2 h-6 flex-1 max-w-[200px] shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100">
            <Search size={12} className="text-gray-400 mr-1.5 shrink-0" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={searchPlaceholder}
              className="bg-transparent text-[10px] font-bold outline-none w-full text-gray-700 placeholder-gray-400 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {searchValue ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchValue("")}
                className="p-0.5 rounded-full hover:bg-gray-100 ml-1 transition-colors text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X size={10} />
              </button>
            ) : null}
          </div>
          {onToolbarDateChange ? (
            <div className="group relative flex items-center bg-white border border-gray-200/80 rounded-lg h-7 min-w-[140px] shadow-sm hover:shadow-md hover:border-blue-300/60 transition-all duration-200 overflow-hidden cursor-pointer">
              <div className="flex items-center justify-center w-7 h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-r border-gray-100 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-200">
                <CalendarDays size={14} className="text-blue-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <input
                type="date"
                aria-label="Date"
                value={toolbarDate ?? ""}
                onChange={(event) => onToolbarDateChange(event.target.value)}
                className="flex-1 bg-transparent text-[11px] font-semibold text-gray-700 outline-none px-2.5 h-full cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <div className="flex items-center justify-center pr-2">
                <ChevronDown size={12} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {showCompactToggle ? (
            <>
              <button
                type="button"
                onClick={handleCompactToggle}
                title="Toggle compact rows + auto-fit columns"
                className={cn(
                  "px-2 h-6 text-[10px] font-bold rounded shadow-sm flex items-center transition-colors border",
                  isCompact
                    ? "bg-violet-100 text-violet-700 border-violet-300"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-violet-50 hover:text-violet-600"
                )}
              >
                <Rows3 size={12} />
                <span className="ml-1">{isCompact ? "Compact ✓" : "Compact"}</span>
              </button>
              {showLayoutButtons ? <div className="w-px h-4 bg-gray-300 mx-1" /> : null}
            </>
          ) : null}
          {showLayoutButtons ? (
            <>
              <button
                type="button"
                onClick={handleSaveLayout}
                title="Save current column widths, filters, and sort to this browser"
                className="px-2 h-6 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm flex items-center"
              >
                <Save size={12} />
                <span className="ml-1">Save</span>
              </button>
              <button
                type="button"
                onClick={handleRestoreLayout}
                title="Restore previously saved layout"
                className="px-2 h-6 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm flex items-center"
              >
                <RotateCcw size={12} />
                <span className="ml-1">Restore</span>
              </button>
              <button
                type="button"
                onClick={handleResetLayout}
                title="Reset to default columns and clear all filters"
                className="px-2 h-6 bg-white border border-gray-200 text-gray-500 text-[10px] font-bold rounded hover:bg-gray-50 hover:text-red-600 transition-colors shadow-sm flex items-center"
              >
                <X size={12} />
                <span className="ml-1">Reset</span>
              </button>
            </>
          ) : null}
          {toolbarEnd}
        </div>
      </div>
      {filterBar}
      {errorMessage ? (
        <div className="m-3 rounded border border-red-500/40 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <AgGridReact
            theme={pmtTheme}
            columnDefs={columns}
            rowData={effectiveRows}
            defaultColDef={defaultColDef}
            getRowId={getRowId}
            onGridReady={onGridReady}
            loading={isLoading}
            overlayNoRowsTemplate={`<span style="padding: 10px; color: #6b7280;">${emptyMessage}</span>`}
            statusBar={statusBar}
            cellSelection={cellSelection}
            rowSelection={rowSelection}
            rowNumbers={rowNumbers}
            rowGroupPanelShow={rowGroupPanelShow}
            groupDefaultExpanded={groupDefaultExpanded}
            getContextMenuItems={getContextMenuItems}
            animateRows
          />
        </div>
      )}
    </div>
  );
}
