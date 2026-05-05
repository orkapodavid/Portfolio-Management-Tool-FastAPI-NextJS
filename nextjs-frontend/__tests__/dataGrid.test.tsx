import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DataGrid } from "@/components/grid/data-grid";
import { textColumn, currencyColumn, percentColumn } from "@/components/grid/columns";

jest.mock("ag-grid-react", () => ({
  __esModule: true,
  AgGridReact: ({
    columnDefs,
    rowData,
  }: {
    columnDefs: { headerName: string; field: string }[];
    rowData: Record<string, unknown>[];
  }) => (
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
  ),
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
});
