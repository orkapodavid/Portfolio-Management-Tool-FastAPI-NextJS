import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";

import {
  GridRegistryProvider,
  PENDING_HIGHLIGHT_STORAGE_KEY,
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
  beforeEach(() => {
    window.sessionStorage.clear();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = "";
  });

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

  it("executes and clears a pending sessionStorage highlight when the grid registers", () => {
    const { api, node } = buildApi();
    window.sessionStorage.setItem(
      PENDING_HIGHLIGHT_STORAGE_KEY,
      JSON.stringify({
        gridId: "pnl_change_grid",
        rowId: "AAPL",
        rowIdKey: "ticker",
      })
    );
    const { result } = renderHook(() => useGridRegistry(), { wrapper });

    act(() => {
      result.current!.register("pnl_change_grid", { api, rowIdKey: "id" });
    });

    expect(api.ensureNodeVisible).toHaveBeenCalledWith(node, "middle");
    expect(api.flashCells).toHaveBeenCalledWith({ rowNodes: [node] });
    expect(window.sessionStorage.getItem(PENDING_HIGHLIGHT_STORAGE_KEY)).toBeNull();
  });

  it("keeps retrying pending highlights beyond 10 seconds", () => {
    jest.useFakeTimers();
    const node: RowNodeLike = { id: "row-AAPL", data: { ticker: "AAPL" } };
    let rowIsLoaded = false;
    const api: GridApiLike = {
      getRowNode: jest.fn(() => undefined),
      forEachNode: jest.fn((cb) => {
        if (rowIsLoaded) cb(node);
      }),
      ensureNodeVisible: jest.fn(),
      flashCells: jest.fn(),
    };
    window.sessionStorage.setItem(
      PENDING_HIGHLIGHT_STORAGE_KEY,
      JSON.stringify({
        gridId: "pnl_change_grid",
        rowId: "AAPL",
        rowIdKey: "ticker",
      })
    );
    const { result } = renderHook(() => useGridRegistry(), { wrapper });

    act(() => {
      result.current!.register("pnl_change_grid", { api, rowIdKey: "ticker" });
      jest.advanceTimersByTime(10_200);
    });
    expect(api.ensureNodeVisible).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(PENDING_HIGHLIGHT_STORAGE_KEY)).not.toBeNull();

    rowIsLoaded = true;
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(api.ensureNodeVisible).toHaveBeenCalledWith(node, "middle");
    expect(api.flashCells).toHaveBeenCalledWith({ rowNodes: [node] });
    expect(window.sessionStorage.getItem(PENDING_HIGHLIGHT_STORAGE_KEY)).toBeNull();
  });

  it("re-applies the sticky highlight every 200ms and clears it after 1.8s", () => {
    jest.useFakeTimers();
    const { api } = buildApi();
    document.body.innerHTML = `<div row-id="row-AAPL"></div>`;
    const row = document.querySelector("[row-id='row-AAPL']")!;
    const { result } = renderHook(() => useGridRegistry(), { wrapper });

    act(() => {
      result.current!.register("positions_grid", { api, rowIdKey: "ticker" });
      result.current!.jumpToRow("positions_grid", "row-AAPL");
    });

    expect(row).toHaveClass("pmt-notification-highlight");
    row.classList.remove("pmt-notification-highlight");

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(row).toHaveClass("pmt-notification-highlight");
    row.classList.remove("pmt-notification-highlight");

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(row).toHaveClass("pmt-notification-highlight");

    act(() => {
      jest.advanceTimersByTime(1_400);
    });
    expect(row).not.toHaveClass("pmt-notification-highlight");
  });
});
