import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";

import {
  GridRegistryProvider,
  useGridRegistry,
  type GridApiLike,
  type RowNodeLike,
} from "@/lib/grid-registry";

const wrapper = ({ children }: { children: ReactNode }) => (
  <GridRegistryProvider>{children}</GridRegistryProvider>
);

const buildApi = (overrides: Partial<GridApiLike> = {}) => {
  const ensureNodeVisible = jest.fn();
  const flashCells = jest.fn();
  const node: RowNodeLike = { id: "row-AAPL", data: { ticker: "AAPL" } };
  const api: GridApiLike = {
    getRowNode: jest.fn((id: string) => (id === "row-AAPL" ? node : undefined)),
    forEachNode: jest.fn((cb: (n: RowNodeLike) => void) => cb(node)),
    ensureNodeVisible,
    flashCells,
    ...overrides,
  };
  return { api, node };
};

describe("GridRegistry", () => {
  it("returns null outside a provider", () => {
    const { result } = renderHook(() => useGridRegistry());
    expect(result.current).toBeNull();
  });

  it("looks up by getRowNode and triggers ensureNodeVisible + flash", () => {
    const { api, node } = buildApi();
    const { result } = renderHook(() => useGridRegistry(), { wrapper });

    let unregister!: () => void;
    act(() => {
      unregister = result.current!.register("positions_grid", { api, rowIdKey: "ticker" });
    });

    let jumped = false;
    act(() => {
      jumped = result.current!.jumpToRow("positions_grid", "row-AAPL");
    });
    expect(jumped).toBe(true);
    expect(api.ensureNodeVisible).toHaveBeenCalledWith(node, "middle");
    expect(api.flashCells).toHaveBeenCalledWith({ rowNodes: [node] });

    unregister();
    let jumpedAfter = false;
    act(() => {
      jumpedAfter = result.current!.jumpToRow("positions_grid", "row-AAPL");
    });
    expect(jumpedAfter).toBe(false);
  });

  it("falls back to forEachNode when getRowNode misses", () => {
    const node: RowNodeLike = { id: "row-1", data: { ticker: "AAPL" } };
    const api: GridApiLike = {
      getRowNode: jest.fn(() => undefined),
      forEachNode: jest.fn((cb) => cb(node)),
      ensureNodeVisible: jest.fn(),
      flashCells: jest.fn(),
    };
    const { result } = renderHook(() => useGridRegistry(), { wrapper });

    act(() => {
      result.current!.register("positions_grid", { api, rowIdKey: "ticker" });
    });

    let jumped = false;
    act(() => {
      jumped = result.current!.jumpToRow("positions_grid", "AAPL");
    });
    expect(jumped).toBe(true);
    expect(api.ensureNodeVisible).toHaveBeenCalledWith(node, "middle");
  });

  it("returns false when no grid is registered for the id", () => {
    const { result } = renderHook(() => useGridRegistry(), { wrapper });
    let jumped = false;
    act(() => {
      jumped = result.current!.jumpToRow("missing_grid", "x");
    });
    expect(jumped).toBe(false);
  });
});
