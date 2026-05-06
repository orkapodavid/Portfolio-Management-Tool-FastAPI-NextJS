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
import {
  FileSpreadsheet,
  RefreshCw,
  RotateCcw,
  Rows3,
  Save,
  Search,
  X,
} from "lucide-react";

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
};

const COMPACT_ROW_HEIGHT = 28;
const COMPACT_HEADER_HEIGHT = 32;
const NORMAL_ROW_HEIGHT = 42;
const NORMAL_HEADER_HEIGHT = 48;

const STORAGE_PREFIX = "pmt:next:";

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
}: DataGridProps<TRow>) {
  const [searchValue, setSearchValue] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
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

  const storageKey = gridId ? `${STORAGE_PREFIX}${gridId}_state` : "";
  const showLayoutButtons = Boolean(gridId) && !hideLayoutButtons;

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
  };

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

  const getRowId = useMemo(
    () => (params: { data: TRow }) =>
      String((params.data as Record<string, unknown>)[rowIdKey] ?? ""),
    [rowIdKey]
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
    api.exportDataAsCsv({
      fileName: `${fileName}.csv`,
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

  return (
    <div className={cn("flex flex-col h-full min-h-0 w-full bg-white", className)}>
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#F9F9F9] border-b border-gray-200 shrink-0 h-[40px]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
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
