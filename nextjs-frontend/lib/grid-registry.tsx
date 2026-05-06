"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export type GridApiLike = {
  getRowNode: (id: string) => RowNodeLike | undefined;
  forEachNode: (cb: (node: RowNodeLike) => void) => void;
  ensureNodeVisible: (
    node: RowNodeLike | string | ((row: RowNodeLike) => boolean),
    pos?: "top" | "middle" | "bottom"
  ) => void;
  flashCells: (params: { rowNodes: RowNodeLike[] }) => void;
};

export type RowNodeLike = {
  id?: string;
  rowIndex?: number | null;
  data?: Record<string, unknown>;
};

type Registration = {
  api: GridApiLike;
  rowIdKey: string;
};

type GridRegistryContextValue = {
  register: (gridId: string, entry: Registration) => () => void;
  jumpToRow: (gridId: string, rowId: string, rowIdKeyOverride?: string) => boolean;
};

type PendingHighlight = {
  gridId: string;
  rowId: string;
  rowIdKey?: string;
};

export const PENDING_HIGHLIGHT_STORAGE_KEY = "pmt:next:pendingHighlight";

const GridRegistryContext = createContext<GridRegistryContextValue | null>(null);

const normalizePendingHighlight = (value: unknown): PendingHighlight | null => {
  if (typeof value !== "object" || value === null) return null;
  const pending = value as Record<string, unknown>;
  const gridId = pending.gridId ?? pending.grid_id;
  const rowId = pending.rowId ?? pending.row_id;
  const rowIdKey = pending.rowIdKey ?? pending.row_id_key;
  if (typeof gridId !== "string" || typeof rowId !== "string") return null;
  return {
    gridId,
    rowId,
    rowIdKey: typeof rowIdKey === "string" ? rowIdKey : undefined,
  };
};

const readPendingHighlight = (): PendingHighlight | null => {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(PENDING_HIGHLIGHT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizePendingHighlight(JSON.parse(raw));
  } catch {
    window.sessionStorage.removeItem(PENDING_HIGHLIGHT_STORAGE_KEY);
    return null;
  }
};

export function GridRegistryProvider({ children }: { children: ReactNode }) {
  const registry = useRef<Map<string, Registration>>(new Map());
  const highlightIntervalRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  const clearNotificationHighlight = useCallback(() => {
    if (typeof window !== "undefined") {
      if (highlightIntervalRef.current !== null) {
        window.clearInterval(highlightIntervalRef.current);
        highlightIntervalRef.current = null;
      }
      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
    }
    if (typeof document !== "undefined") {
      document
        .querySelectorAll(".pmt-notification-highlight")
        .forEach((el) => el.classList.remove("pmt-notification-highlight"));
    }
  }, []);

  const jumpToRow = useCallback(
    (gridId: string, rowId: string, rowIdKeyOverride?: string) => {
      const entry = registry.current.get(gridId);
      if (!entry) return false;
      const { api, rowIdKey } = entry;
      const matchRowIdKey = rowIdKeyOverride || rowIdKey;

      let node = api.getRowNode(rowId);
      if (!node) {
        api.forEachNode((current) => {
          if (node) return;
          const value = current.data?.[matchRowIdKey];
          if (value !== undefined && String(value) === String(rowId)) {
            node = current;
          }
        });
      }
      if (!node) return false;

      api.ensureNodeVisible(node, "middle");
      api.flashCells({ rowNodes: [node] });

      if (typeof document !== "undefined" && node.id) {
        clearNotificationHighlight();
        const highlightedRowId = node.id;
        const apply = () => {
          document
            .querySelectorAll(".pmt-notification-highlight")
            .forEach((el) => {
              if (el.getAttribute("row-id") !== highlightedRowId) {
                el.classList.remove("pmt-notification-highlight");
              }
            });
          document
            .querySelectorAll<HTMLElement>("[row-id]")
            .forEach((el) => {
              if (el.getAttribute("row-id") === highlightedRowId) {
                el.classList.add("pmt-notification-highlight");
              }
            });
        };
        apply();
        highlightIntervalRef.current = window.setInterval(apply, 200);
        highlightTimeoutRef.current = window.setTimeout(() => {
          clearNotificationHighlight();
        }, 1_800);
      }

      return true;
    },
    [clearNotificationHighlight]
  );

  useEffect(
    () => () => {
      clearNotificationHighlight();
    },
    [clearNotificationHighlight]
  );

  const register = useCallback(
    (gridId: string, entry: Registration) => {
      registry.current.set(gridId, entry);

      let retryId: number | null = null;
      if (typeof window !== "undefined") {
        const startedAt = Date.now();
        const tryPendingHighlight = () => {
          const pending = readPendingHighlight();
          if (!pending || pending.gridId !== gridId) return false;
          if (jumpToRow(pending.gridId, pending.rowId, pending.rowIdKey)) {
            window.sessionStorage.removeItem(PENDING_HIGHLIGHT_STORAGE_KEY);
            if (retryId !== null) {
              window.clearInterval(retryId);
              retryId = null;
            }
            return false;
          }
          if (Date.now() - startedAt > 10_000 && retryId !== null) {
            window.clearInterval(retryId);
            retryId = null;
            return false;
          }
          return true;
        };

        if (tryPendingHighlight()) {
          retryId = window.setInterval(tryPendingHighlight, 200);
        }
      }

      return () => {
        if (retryId !== null) {
          window.clearInterval(retryId);
        }
        const existing = registry.current.get(gridId);
        if (existing && existing.api === entry.api) {
          registry.current.delete(gridId);
        }
      };
    },
    [jumpToRow]
  );

  const value = useMemo<GridRegistryContextValue>(
    () => ({ register, jumpToRow }),
    [register, jumpToRow]
  );

  return (
    <GridRegistryContext.Provider value={value}>
      {children}
    </GridRegistryContext.Provider>
  );
}

export function useGridRegistry(): GridRegistryContextValue | null {
  return useContext(GridRegistryContext);
}
