import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";

import UndertakingsPage from "../app/dashboard/compliance/undertakings/page";

const replaceMock = jest.fn();
const routerMock = { replace: replaceMock };
const mockComplianceGetUndertakings = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

jest.mock("../lib/auth/token-storage", () => ({
  getAuthToken: () => "test-token",
}));

jest.mock("../app/clientService", () => ({
  complianceGetUndertakings: (...args: unknown[]) =>
    mockComplianceGetUndertakings(...args),
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

describe("compliance page filter bars", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    mockComplianceGetUndertakings.mockReset();
  });

  it("wires Undertakings position date into the API query", async () => {
    mockComplianceGetUndertakings.mockResolvedValue({
      data: [{ id: 1, ticker: "AAPL" }],
    });

    render(<UndertakingsPage />);

    await waitFor(() =>
      expect(mockComplianceGetUndertakings).toHaveBeenCalledWith({
        headers: { Authorization: "Bearer test-token" },
        query: undefined,
      }),
    );

    fireEvent.change(screen.getByLabelText("Position Date"), {
      target: { value: "2026-05-06" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() =>
      expect(mockComplianceGetUndertakings).toHaveBeenLastCalledWith({
        headers: { Authorization: "Bearer test-token" },
        query: { position_date: "2026-05-06" },
      }),
    );
  });
});
