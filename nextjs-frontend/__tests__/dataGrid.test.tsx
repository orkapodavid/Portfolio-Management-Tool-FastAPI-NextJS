import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DataGrid } from "@/components/grid/data-grid";
import {
  textColumn,
  currencyColumn,
  percentColumn,
} from "@/components/grid/columns";

let lastGridReadyHandler: ((event: { api: GridApiStub }) => void) | null = null;
let lastGetRowId:
  | ((params: { data: Record<string, unknown> }) => string)
  | undefined = undefined;

type GridApiStub = {
  setGridOption: jest.Mock;
  getState: jest.Mock;
  setState: jest.Mock;
  getSelectedRows: jest.Mock;
  exportDataAsExcel: jest.Mock;
  resetColumnState: jest.Mock;
  setFilterModel: jest.Mock;
};

const buildGridApi = (overrides: Partial<GridApiStub> = {}): GridApiStub => ({
  setGridOption: jest.fn(),
  getState: jest.fn(() => ({
    columnSizing: {
      columnSizingModel: [{ colId: "ticker", width: 100, flex: 1 }],
    },
  })),
  setState: jest.fn(),
  getSelectedRows: jest.fn(() => []),
  exportDataAsExcel: jest.fn(),
  resetColumnState: jest.fn(),
  setFilterModel: jest.fn(),
  ...overrides,
});

jest.mock("ag-grid-react", () => ({
  __esModule: true,
  AgGridReact: ({
    columnDefs,
    rowData,
    onGridReady,
    getRowId,
  }: {
    columnDefs: { headerName: string; field: string }[];
    rowData: Record<string, unknown>[];
    onGridReady?: (event: { api: GridApiStub }) => void;
    getRowId?: (params: { data: Record<string, unknown> }) => string;
  }) => {
    if (onGridReady) lastGridReadyHandler = onGridReady;
    lastGetRowId = getRowId;
    return (
      <div data-testid="ag-grid-mock">
        <div data-testid="ag-headers">
          {columnDefs.map((col) => (
            <span key={col.field} data-testid={`header-${col.field}`}>
              {col.headerName}
            </span>
          ))}
        </div>
        <div data-testid="ag-rows">
          {rowData.map((row, idx) => (
            <span key={idx} data-testid={`row-${idx}`}>
              {String(row.ticker ?? idx)}
            </span>
          ))}
        </div>
      </div>
    );
  },
}));

jest.mock("ag-grid-community", () => ({
  AllCommunityModule: {},
  ModuleRegistry: { registerModules: jest.fn() },
  themeQuartz: { withParams: jest.fn().mockReturnValue({}) },
}));

jest.mock("ag-grid-enterprise", () => ({
  AllEnterpriseModule: {},
}));

describe("DataGrid", () => {
  type Row = { id: number; ticker: string; price: number; chg: number };

  const columns = [
    textColumn({ field: "ticker", header: "Ticker", pinned: "left" }),
    currencyColumn({ field: "price", header: "Price" }),
    percentColumn({ field: "chg", header: "Change" }),
  ];
  const rows: Row[] = [
    { id: 1, ticker: "AAPL", price: 182.5, chg: 0.5 },
    { id: 2, ticker: "MSFT", price: 402.1, chg: 0.85 },
  ];

  beforeEach(() => {
    lastGridReadyHandler = null;
    lastGetRowId = undefined;
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the toolbar (refresh + search) and the grid headers", () => {
    render(
      <DataGrid<Row>
        columns={columns}
        rows={rows}
        onRefresh={() => {}}
        searchPlaceholder="Search rows…"
      />,
    );

    expect(screen.getByPlaceholderText("Search rows…")).toBeInTheDocument();
    expect(screen.getByLabelText("Refresh")).toBeInTheDocument();
    expect(screen.getByTestId("header-ticker")).toHaveTextContent("Ticker");
    expect(screen.getByTestId("header-price")).toHaveTextContent("Price");
    expect(screen.getByTestId("header-chg")).toHaveTextContent("Change");
    expect(screen.getByTestId("row-0")).toHaveTextContent("AAPL");
    expect(screen.getByTestId("row-1")).toHaveTextContent("MSFT");
  });

  it("renders an error block instead of the grid when errorMessage is set", () => {
    render(
      <DataGrid<Row>
        columns={columns}
        rows={[]}
        errorMessage="Could not load market data."
      />,
    );

    expect(screen.getByText("Could not load market data.")).toBeInTheDocument();
    expect(screen.queryByTestId("ag-grid-mock")).not.toBeInTheDocument();
  });

  it("does not show the layout / export buttons when no gridId is provided", () => {
    render(<DataGrid<Row> columns={columns} rows={rows} />);

    expect(
      screen.queryByRole("button", { name: /save/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /restore/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /excel/i }),
    ).not.toBeInTheDocument();
  });

  it("clears the search input when the X button is clicked", () => {
    render(
      <DataGrid<Row> columns={columns} rows={rows} searchPlaceholder="Find…" />,
    );

    const input = screen.getByPlaceholderText("Find…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "AAPL" } });
    expect(input.value).toBe("AAPL");

    const clearBtn = screen.getByLabelText("Clear search");
    fireEvent.click(clearBtn);
    expect(input.value).toBe("");
  });

  it("debounces AG Grid quick-filter updates by 300 ms", async () => {
    jest.useFakeTimers();
    const api = buildGridApi();
    render(
      <DataGrid<Row> columns={columns} rows={rows} searchPlaceholder="Find…" />,
    );
    lastGridReadyHandler!({ api });

    const input = screen.getByPlaceholderText("Find…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "AAP" } });
    fireEvent.change(input, { target: { value: "AAPL" } });

    await act(async () => {
      jest.advanceTimersByTime(299);
    });
    expect(api.setGridOption).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(api.setGridOption).toHaveBeenCalledTimes(1);
    expect(api.setGridOption).toHaveBeenCalledWith("quickFilterText", "AAPL");
  });

  it("persists state under a namespaced key on Save and round-trips on Restore", () => {
    const api = buildGridApi();
    render(
      <DataGrid<Row> columns={columns} rows={rows} gridId="positions_grid" />,
    );

    expect(lastGridReadyHandler).not.toBeNull();
    lastGridReadyHandler!({ api });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(api.getState).toHaveBeenCalled();
    const persisted = window.localStorage.getItem(
      "pmt:next:positions_grid_state",
    );
    expect(persisted).not.toBeNull();
    expect(JSON.parse(persisted!).columnSizing.columnSizingModel[0].width).toBe(
      100,
    );

    fireEvent.click(screen.getByRole("button", { name: /restore/i }));
    expect(api.setState).toHaveBeenCalled();
    const restored = api.setState.mock.calls.at(-1)?.[0];
    // flex must have been stripped when restoring
    expect(restored.columnSizing.columnSizingModel[0]).not.toHaveProperty(
      "flex",
    );
  });

  it("clears storage, grid filters, and toolbar search when Reset is clicked", async () => {
    jest.useFakeTimers();
    const api = buildGridApi();
    window.localStorage.setItem(
      "pmt:next:positions_grid_state",
      JSON.stringify({ columnSizing: { columnSizingModel: [] } }),
    );
    render(
      <DataGrid<Row>
        columns={columns}
        rows={rows}
        gridId="positions_grid"
        searchPlaceholder="Find…"
      />,
    );
    lastGridReadyHandler!({ api });

    const input = screen.getByPlaceholderText("Find…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "AAPL" } });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(api.setGridOption).toHaveBeenLastCalledWith(
      "quickFilterText",
      "AAPL",
    );

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(api.resetColumnState).toHaveBeenCalled();
    expect(api.setFilterModel).toHaveBeenCalledWith(null);
    expect(input.value).toBe("");
    expect(api.setGridOption).toHaveBeenLastCalledWith("quickFilterText", "");
    expect(
      window.localStorage.getItem("pmt:next:positions_grid_state"),
    ).toBeNull();
  });

  it("Excel button calls exportDataAsExcel with a timestamped .xlsx filename", () => {
    const api = buildGridApi();
    render(
      <DataGrid<Row> columns={columns} rows={rows} gridId="positions_grid" />,
    );
    lastGridReadyHandler!({ api });

    fireEvent.click(screen.getByRole("button", { name: /excel/i }));
    expect(api.exportDataAsExcel).toHaveBeenCalled();
    const params = api.exportDataAsExcel.mock.calls[0][0];
    expect(params.fileName).toMatch(/^positions_\d{8}_\d{4}\.xlsx$/);
  });

  it.each([
    { intervalMs: 1_000, elapsedMs: 2_500, expectedCalls: 2 },
    { intervalMs: 2_000, elapsedMs: 4_500, expectedCalls: 2 },
  ])(
    "auto-refresh defaults ON and fires onRefresh every $intervalMs ms",
    async ({ intervalMs, elapsedMs, expectedCalls }) => {
      jest.useFakeTimers();
      const refresh = jest.fn(() => Promise.resolve());
      render(
        <DataGrid<Row>
          columns={columns}
          rows={rows}
          gridId="positions_grid"
          showAutoRefresh
          autoRefreshIntervalMs={intervalMs}
          onRefresh={refresh}
        />,
      );

      const switchInput = screen.getByLabelText(
        "Auto refresh",
      ) as HTMLInputElement;
      expect(switchInput.checked).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(elapsedMs);
        await Promise.resolve();
      });
      expect(refresh).toHaveBeenCalledTimes(expectedCalls);

      fireEvent.click(switchInput);
      refresh.mockClear();
      await act(async () => {
        jest.advanceTimersByTime(elapsedMs * 2);
        await Promise.resolve();
      });
      expect(refresh).not.toHaveBeenCalled();
      jest.useRealTimers();
    },
  );

  it("polling cadence implicitly matches simulator interval when simulateUpdate is set without an explicit autoRefreshIntervalMs", async () => {
    jest.useFakeTimers();
    const refresh = jest.fn(() => Promise.resolve());
    const simulateUpdate = jest.fn((current: Row[]) => current);

    render(
      <DataGrid<Row>
        columns={columns}
        rows={rows}
        gridId="positions_grid"
        showAutoRefresh
        simulateUpdate={simulateUpdate}
        simulateUpdateIntervalMs={2_000}
        onRefresh={refresh}
      />,
    );

    await act(async () => {
      jest.advanceTimersByTime(4_500);
      await Promise.resolve();
    });

    // Polling at 30 s default would fire 0 times in 4.5 s; simulator-driven
    // 2 s cadence should fire 2 times. This proves the implicit drop.
    expect(refresh).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it("explicit autoRefreshIntervalMs still wins over the simulator default", async () => {
    jest.useFakeTimers();
    const refresh = jest.fn(() => Promise.resolve());
    const simulateUpdate = jest.fn((current: Row[]) => current);

    render(
      <DataGrid<Row>
        columns={columns}
        rows={rows}
        gridId="positions_grid"
        showAutoRefresh
        autoRefreshIntervalMs={30_000}
        simulateUpdate={simulateUpdate}
        simulateUpdateIntervalMs={2_000}
        onRefresh={refresh}
      />,
    );

    await act(async () => {
      jest.advanceTimersByTime(10_000);
      await Promise.resolve();
    });

    // With explicit 30 s polling, no backend tick yet at t=10 s.
    expect(refresh).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("respects defaultAutoRefreshOff when showAutoRefresh is set", () => {
    render(
      <DataGrid<Row>
        columns={columns}
        rows={rows}
        gridId="positions_grid"
        showAutoRefresh
        defaultAutoRefreshOff
        onRefresh={() => Promise.resolve()}
      />,
    );
    const switchInput = screen.getByLabelText(
      "Auto refresh",
    ) as HTMLInputElement;
    expect(switchInput.checked).toBe(false);
  });

  it("runs the simulator on its own interval when auto-refresh is on", async () => {
    jest.useFakeTimers();
    const simulateUpdate = jest.fn((currentRows: Row[]) =>
      currentRows.map((row) =>
        row.ticker === "AAPL" ? { ...row, price: row.price + 1 } : row,
      ),
    );

    render(
      <DataGrid<Row>
        columns={columns}
        rows={rows}
        gridId="positions_grid"
        showAutoRefresh
        simulateUpdate={simulateUpdate}
        simulateUpdateIntervalMs={2_000}
      />,
    );

    await act(async () => {
      jest.advanceTimersByTime(4_500);
      await Promise.resolve();
    });

    expect(simulateUpdate).toHaveBeenCalledTimes(2);

    const switchInput = screen.getByLabelText(
      "Auto refresh",
    ) as HTMLInputElement;
    fireEvent.click(switchInput);
    simulateUpdate.mockClear();

    await act(async () => {
      jest.advanceTimersByTime(4_500);
      await Promise.resolve();
    });

    expect(simulateUpdate).not.toHaveBeenCalled();
  });

  it("bumps lastUpdated when isLoading transitions from true to false without an error", () => {
    const { rerender } = render(
      <DataGrid<Row>
        columns={columns}
        rows={[]}
        gridId="positions_grid"
        showAutoRefresh
        isLoading
      />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();

    rerender(
      <DataGrid<Row>
        columns={columns}
        rows={rows}
        gridId="positions_grid"
        showAutoRefresh
        isLoading={false}
      />,
    );
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });

  it("provides getRowId when rows have the rowIdKey field (cell flash works)", () => {
    render(<DataGrid<Row> columns={columns} rows={rows} rowIdKey="ticker" />);
    expect(lastGetRowId).toBeDefined();
    expect(lastGetRowId!({ data: { ticker: "AAPL" } })).toBe("AAPL");
  });

  it("omits getRowId when rows lack the rowIdKey field (avoids id collisions)", () => {
    type NoIdRow = { underlying: string; price: number };
    const noIdRows: NoIdRow[] = [
      { underlying: "Toyota Motor", price: 2876.5 },
      { underlying: "Sony Group", price: 14234.0 },
    ];
    const noIdColumns = [
      textColumn({ field: "underlying", header: "Underlying" }),
      currencyColumn({ field: "price", header: "Price" }),
    ];
    render(<DataGrid<NoIdRow> columns={noIdColumns} rows={noIdRows} />);
    expect(lastGetRowId).toBeUndefined();
  });

  it("Excel button skips unselected rows when at least one row is selected", () => {
    const api = buildGridApi({
      getSelectedRows: jest.fn(() => [{ ticker: "AAPL" }]),
    });
    render(
      <DataGrid<Row> columns={columns} rows={rows} gridId="positions_grid" />,
    );
    lastGridReadyHandler!({ api });

    fireEvent.click(screen.getByRole("button", { name: /excel/i }));
    const params = api.exportDataAsExcel.mock.calls[0][0];
    expect(typeof params.shouldRowBeSkipped).toBe("function");
    expect(
      params.shouldRowBeSkipped({ node: { isSelected: () => true } }),
    ).toBe(false);
    expect(
      params.shouldRowBeSkipped({ node: { isSelected: () => false } }),
    ).toBe(true);
  });
});
