"use client";

import {
  createContext,
  useCallback,
  useContext,
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
  jumpToRow: (gridId: string, rowId: string) => boolean;
};

const GridRegistryContext = createContext<GridRegistryContextValue | null>(null);

export function GridRegistryProvider({ children }: { children: ReactNode }) {
  const registry = useRef<Map<string, Registration>>(new Map());

  const register = useCallback((gridId: string, entry: Registration) => {
    registry.current.set(gridId, entry);
    return () => {
      const existing = registry.current.get(gridId);
      if (existing && existing.api === entry.api) {
        registry.current.delete(gridId);
      }
    };
  }, []);

  const jumpToRow = useCallback((gridId: string, rowId: string) => {
    const entry = registry.current.get(gridId);
    if (!entry) return false;
    const { api, rowIdKey } = entry;

    let node = api.getRowNode(rowId);
    if (!node) {
      api.forEachNode((current) => {
        if (node) return;
        const value = current.data?.[rowIdKey];
        if (value !== undefined && String(value) === String(rowId)) {
          node = current;
        }
      });
    }
    if (!node) return false;

    api.ensureNodeVisible(node, "middle");
    api.flashCells({ rowNodes: [node] });

    if (typeof document !== "undefined" && node.id) {
      const apply = () => {
        document
          .querySelectorAll(".pmt-notification-highlight")
          .forEach((el) => el.classList.remove("pmt-notification-highlight"));
        document
          .querySelectorAll<HTMLElement>(`[row-id='${node!.id}']`)
          .forEach((el) => el.classList.add("pmt-notification-highlight"));
      };
      apply();
      window.setTimeout(apply, 100);
      window.setTimeout(apply, 350);
      window.setTimeout(() => {
        document
          .querySelectorAll(".pmt-notification-highlight")
          .forEach((el) => el.classList.remove("pmt-notification-highlight"));
      }, 1_800);
    }

    return true;
  }, []);

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
