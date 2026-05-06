import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";

import HistoricalDataPage from "../app/dashboard/market-data/historical-data/page";
import TradingCalendarPage from "../app/dashboard/market-data/trading-calendar/page";

const replaceMock = jest.fn();
const routerMock = { replace: replaceMock };
const mockMarketDataGetHistoricalData = jest.fn();
const mockMarketDataGetTradingCalendar = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

jest.mock("../lib/auth/token-storage", () => ({
  getAuthToken: () => "test-token",
}));

jest.mock("../app/clientService", () => ({
  marketDataGetHistoricalData: (...args: unknown[]) =>
    mockMarketDataGetHistoricalData(...args),
  marketDataGetTradingCalendar: (...args: unknown[]) =>
    mockMarketDataGetTradingCalendar(...args),
}));

jest.mock("../components/grid/data-grid", () => ({
  DataGrid: ({
    filterBar,
    onRefresh,
    rows,
  }: {
    filterBar?: ReactNode;
    onRefresh?: () => void;
    rows?: unknown[];
  }) => (
    <section>
      <div data-testid="filter-bar">{filterBar}</div>
      <button type="button" onClick={onRefresh}>
        Refresh
      </button>
      <output data-testid="row-count">{rows?.length ?? 0}</output>
    </section>
  ),
}));

describe("market data page filter bars", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    mockMarketDataGetHistoricalData.mockReset();
    mockMarketDataGetTradingCalendar.mockReset();
  });

  it("wires Historical Data ticker and date filters into the API query", async () => {
    mockMarketDataGetHistoricalData.mockResolvedValue({
      data: [
        { id: 1, ticker: "AAPL" },
        { id: 2, ticker: "MSFT" },
      ],
    });

    render(<HistoricalDataPage />);

    await waitFor(() =>
      expect(mockMarketDataGetHistoricalData).toHaveBeenCalledWith({
        headers: { Authorization: "Bearer test-token" },
        query: undefined,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /ticker filter/i }));
    fireEvent.click(screen.getByRole("option", { name: "AAPL" }));
    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "2026-01-31" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() =>
      expect(mockMarketDataGetHistoricalData).toHaveBeenLastCalledWith({
        headers: { Authorization: "Bearer test-token" },
        query: {
          tickers: "AAPL",
          start_date: "2026-01-01",
          end_date: "2026-01-31",
        },
      }),
    );
  });

  it("wires Trading Calendar date range filters into the API query", async () => {
    mockMarketDataGetTradingCalendar.mockResolvedValue({
      data: [{ id: 1, trade_date: "2026-01-02" }],
    });

    render(<TradingCalendarPage />);

    await waitFor(() =>
      expect(mockMarketDataGetTradingCalendar).toHaveBeenCalledWith({
        headers: { Authorization: "Bearer test-token" },
        query: undefined,
      }),
    );

    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "2026-02-01" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "2026-02-28" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() =>
      expect(mockMarketDataGetTradingCalendar).toHaveBeenLastCalledWith({
        headers: { Authorization: "Bearer test-token" },
        query: {
          start_date: "2026-02-01",
          end_date: "2026-02-28",
        },
      }),
    );
  });
});
