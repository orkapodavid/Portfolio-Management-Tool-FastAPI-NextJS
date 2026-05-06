import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  StockScreenerFilterBar,
  createEmptyStockScreenerFilters,
  filterStockScreenerRows,
  type StockScreenerFilterState,
} from "@/components/grid/stock-screener-filter-bar";

const readState = (testId: string) =>
  JSON.parse(
    screen.getByTestId(testId).textContent ?? "{}",
  ) as StockScreenerFilterState;

function Harness() {
  const [draft, setDraft] = useState(() => createEmptyStockScreenerFilters());
  const [applied, setApplied] = useState(() =>
    createEmptyStockScreenerFilters(),
  );

  return (
    <>
      <StockScreenerFilterBar
        value={draft}
        availableCountries={["Hong Kong", "Japan", "United States"]}
        hasActiveFilters={Boolean(
          applied.dtl10Min ||
            applied.dtl10Max ||
            applied.mktCapMin ||
            applied.mktCapMax ||
            applied.adv3mMin ||
            applied.adv3mMax ||
            applied.countries.length > 0,
        )}
        onChange={setDraft}
        onApply={() =>
          setApplied({ ...draft, countries: [...draft.countries] })
        }
        onClear={() => {
          setDraft(createEmptyStockScreenerFilters());
          setApplied(createEmptyStockScreenerFilters());
        }}
      />
      <output data-testid="draft">{JSON.stringify(draft)}</output>
      <output data-testid="applied">{JSON.stringify(applied)}</output>
    </>
  );
}

describe("StockScreenerFilterBar", () => {
  it("applies numeric ranges and selected countries, then clears them", () => {
    render(<Harness />);

    fireEvent.change(screen.getByLabelText("DTL10 min"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Mkt Cap (MM) max"), {
      target: { value: "3000000" },
    });
    fireEvent.change(screen.getByLabelText("$ADV 3M min"), {
      target: { value: "50000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /country filter/i }));
    fireEvent.click(screen.getByRole("option", { name: "Japan" }));
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(readState("applied")).toMatchObject({
      dtl10Min: "3",
      mktCapMax: "3000000",
      adv3mMin: "50000000",
      countries: ["Japan"],
    });
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    expect(readState("draft")).toEqual(createEmptyStockScreenerFilters());
    expect(readState("applied")).toEqual(createEmptyStockScreenerFilters());
    expect(
      screen.queryByRole("button", { name: /clear/i }),
    ).not.toBeInTheDocument();
  });

  it("applies when Enter is pressed in a range input", () => {
    render(<Harness />);

    const input = screen.getByLabelText("DTL10 max");
    fireEvent.change(input, { target: { value: "10" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(readState("applied")).toMatchObject({ dtl10Max: "10" });
  });

  it("filters rows with Reflex-equivalent DTL10, market cap, ADV 3M, and country rules", () => {
    const rows = [
      {
        ticker: "AAPL",
        dtl10: "5",
        mkt_cap_usd: "2,950,000",
        adv_3m_usd: "54,200,000",
        country: "United States",
      },
      {
        ticker: "TM",
        dtl10: "12",
        mkt_cap_usd: "245,000",
        adv_3m_usd: "3,500,000",
        country: "Japan",
      },
      {
        ticker: "0700 HK",
        dtl10: "2",
        mkt_cap_usd: "482,000",
        adv_3m_usd: "1,970,000",
        country: "Hong Kong",
      },
    ];

    expect(
      filterStockScreenerRows(rows, createEmptyStockScreenerFilters()),
    ).toBe(rows);

    const filtered = filterStockScreenerRows(rows, {
      ...createEmptyStockScreenerFilters(),
      dtl10Min: "3",
      dtl10Max: "10",
      mktCapMin: "200000",
      mktCapMax: "3000000",
      adv3mMin: "50000000",
      countries: ["United States"],
    });

    expect(filtered.map((row) => row.ticker)).toEqual(["AAPL"]);
  });
});
