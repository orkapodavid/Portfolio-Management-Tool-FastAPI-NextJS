import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DataGrid } from "@/components/grid/data-grid";
import { textColumn, currencyColumn, percentColumn } from "@/components/grid/columns";

let lastGridReadyHandler: ((event: { api: GridApiStub }) => void) | null = null;

type GridApiStub = {
  setGridOption: jest.Mock;
  getState: jest.Mock;
  setState: jest.Mock;
  getSelectedRows: jest.Mock;
  exportDataAsCsv: jest.Mock;
  resetColumnState: jest.Mock;
  setFilterModel: jest.Mock;
};

const buildGridApi = (overrides: Partial<GridApiStub> = {}): GridApiStub => ({
  setGridOption: jest.fn(),
  getState: jest.fn(() => ({ columnSizing: { columnSizingModel: [{ colId: "ticker", width: 100, flex: 1 }] } })),
  setState: jest.fn(),
  getSelectedRows: jest.fn(() => []),
  exportDataAsCsv: jest.fn(),
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
  }: {
    columnDefs: { headerName: string; field: string }[];
    rowData: Record<string, unknown>[];
    onGridReady?: (event: { api: GridApiStub }) => void;
  }) => {
    if (onGridReady) lastGridReadyHandler = onGridReady;
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
    window.localStorage.clear();
  });

  it("renders the toolbar (refresh + search) and the grid headers", () => {
    render(
      <DataGrid<Row>
        columns={columns}
        rows={rows}
        onRefresh={() => {}}
        searchPlaceholder="Search rows…"
      />
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
      />
    );

    expect(screen.getByText("Could not load market data.")).toBeInTheDocument();
    expect(screen.queryByTestId("ag-grid-mock")).not.toBeInTheDocument();
  });

  it("does not show the layout / export buttons when no gridId is provided", () => {
    render(<DataGrid<Row> columns={columns} rows={rows} />);

    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /restore/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /excel/i })).not.toBeInTheDocument();
  });

  it("clears the search input when the X button is clicked", () => {
    render(
      <DataGrid<Row>
        columns={columns}
        rows={rows}
        searchPlaceholder="Find…"
      />
    );

    const input = screen.getByPlaceholderText("Find…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "AAPL" } });
    expect(input.value).toBe("AAPL");

    const clearBtn = screen.getByLabelText("Clear search");
    fireEvent.click(clearBtn);
    expect(input.value).toBe("");
  });

  it("persists state under a namespaced key on Save and round-trips on Restore", () => {
    const api = buildGridApi();
    render(<DataGrid<Row> columns={columns} rows={rows} gridId="positions_grid" />);

    expect(lastGridReadyHandler).not.toBeNull();
    lastGridReadyHandler!({ api });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(api.getState).toHaveBeenCalled();
    const persisted = window.localStorage.getItem("pmt:next:positions_grid_state");
    expect(persisted).not.toBeNull();
    expect(JSON.parse(persisted!).columnSizing.columnSizingModel[0].width).toBe(100);

    fireEvent.click(screen.getByRole("button", { name: /restore/i }));
    expect(api.setState).toHaveBeenCalled();
    const restored = api.setState.mock.calls.at(-1)?.[0];
    // flex must have been stripped when restoring
    expect(restored.columnSizing.columnSizingModel[0]).not.toHaveProperty("flex");
  });

  it("clears storage and resets columns/filters when Reset is clicked", () => {
    const api = buildGridApi();
    window.localStorage.setItem(
      "pmt:next:positions_grid_state",
      JSON.stringify({ columnSizing: { columnSizingModel: [] } })
    );
    render(<DataGrid<Row> columns={columns} rows={rows} gridId="positions_grid" />);
    lastGridReadyHandler!({ api });

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(api.resetColumnState).toHaveBeenCalled();
    expect(api.setFilterModel).toHaveBeenCalledWith(null);
    expect(window.localStorage.getItem("pmt:next:positions_grid_state")).toBeNull();
  });

  it("Excel button calls exportDataAsCsv with a timestamped filename", () => {
    const api = buildGridApi();
    render(<DataGrid<Row> columns={columns} rows={rows} gridId="positions_grid" />);
    lastGridReadyHandler!({ api });

    fireEvent.click(screen.getByRole("button", { name: /excel/i }));
    expect(api.exportDataAsCsv).toHaveBeenCalled();
    const params = api.exportDataAsCsv.mock.calls[0][0];
    expect(params.fileName).toMatch(/^positions_\d{8}_\d{4}\.csv$/);
  });

  it("auto-refresh status row toggles its switch and fires onRefresh on the interval", async () => {
    jest.useFakeTimers();
    const refresh = jest.fn(() => Promise.resolve());
    render(
      <DataGrid<Row>
        columns={columns}
        rows={rows}
        gridId="positions_grid"
        showAutoRefresh
        autoRefreshIntervalMs={1_000}
        onRefresh={refresh}
      />
    );

    const switchInput = screen.getByLabelText("Auto refresh") as HTMLInputElement;
    expect(switchInput.checked).toBe(false);
    fireEvent.click(switchInput);
    expect(switchInput.checked).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(2_500);
      await Promise.resolve();
    });
    expect(refresh).toHaveBeenCalledTimes(2);

    fireEvent.click(switchInput);
    refresh.mockClear();
    await act(async () => {
      jest.advanceTimersByTime(5_000);
      await Promise.resolve();
    });
    expect(refresh).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("Excel button skips unselected rows when at least one row is selected", () => {
    const api = buildGridApi({ getSelectedRows: jest.fn(() => [{ ticker: "AAPL" }]) });
    render(<DataGrid<Row> columns={columns} rows={rows} gridId="positions_grid" />);
    lastGridReadyHandler!({ api });

    fireEvent.click(screen.getByRole("button", { name: /excel/i }));
    const params = api.exportDataAsCsv.mock.calls[0][0];
    expect(typeof params.shouldRowBeSkipped).toBe("function");
    expect(
      params.shouldRowBeSkipped({ node: { isSelected: () => true } })
    ).toBe(false);
    expect(
      params.shouldRowBeSkipped({ node: { isSelected: () => false } })
    ).toBe(true);
  });
});
