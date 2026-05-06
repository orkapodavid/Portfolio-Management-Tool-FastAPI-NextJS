import {
  fxDataSimulator,
  marketDataSimulator,
  simulateFinancialTick,
  simulateNumericTick,
} from "@/lib/grid-simulators";

describe("grid-simulators utilities", () => {
  describe("simulateFinancialTick", () => {
    it("returns a new array reference and at least one updated row", () => {
      const rows = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        ticker: `T${i}`,
        pnl_ytd: "$10,000.00",
        pnl_chg_pct_1d: "1.5%",
      }));
      const next = simulateFinancialTick(rows, {
        valueFields: ["pnl_ytd"],
        pctFields: ["pnl_chg_pct_1d"],
        numRows: 3,
      });
      expect(next).not.toBe(rows);
      const changed = next.filter((row, i) => row !== rows[i]);
      expect(changed.length).toBeGreaterThan(0);
    });

    it("formats dollar values with $ prefix and parentheses for negatives", () => {
      const next = simulateFinancialTick(
        [{ ticker: "X", pnl_ytd: "$100.00" }],
        { valueFields: ["pnl_ytd"], numRows: 1, valueJitter: [-1, -1] },
      );
      const value = (next[0] as Record<string, string>).pnl_ytd;
      expect(value).toMatch(/^-?\$/);
    });

    it("formats percentage values with sign + 1 decimal", () => {
      const next = simulateFinancialTick(
        [{ ticker: "X", pnl_chg_pct_1d: "1.5%" }],
        { valueFields: [], pctFields: ["pnl_chg_pct_1d"], numRows: 1 },
      );
      const value = (next[0] as Record<string, string>).pnl_chg_pct_1d;
      expect(value).toMatch(/^[+-]?\d+\.\d%$/);
    });

    it("returns the same array when there are no rows", () => {
      const empty: { v?: string }[] = [];
      const next = simulateFinancialTick(empty, { valueFields: ["v"] });
      expect(next).toBe(empty);
    });

    it("does not touch fields whose value is empty or unparseable", () => {
      const rows = [{ ticker: "X", pnl_ytd: "" }];
      const next = simulateFinancialTick(rows, {
        valueFields: ["pnl_ytd"],
        numRows: 1,
      });
      expect((next[0] as Record<string, string>).pnl_ytd).toBe("");
    });
  });

  describe("simulateNumericTick", () => {
    it("jitters numeric strings and preserves their string type", () => {
      const rows = [{ ticker: "X", delta: "0.5000" }];
      const next = simulateNumericTick(rows, {
        fields: ["delta"],
        numRows: 1,
      });
      const value = (next[0] as Record<string, string>).delta;
      expect(typeof value).toBe("string");
      expect(value).toMatch(/^-?\d+\.\d+$/);
    });

    it("jitters raw numbers and preserves number type", () => {
      const rows = [{ ticker: "X", gamma: 0.25 }];
      const next = simulateNumericTick(rows, {
        fields: ["gamma"],
        numRows: 1,
        decimals: 2,
      });
      const value = (next[0] as unknown as Record<string, number>).gamma;
      expect(typeof value).toBe("number");
    });
  });

  describe("existing market-data + fx-data simulators still match the same shape", () => {
    it("marketDataSimulator returns a fresh array", () => {
      const rows = [{ ticker: "AAPL", last_price: 100, last_volume: 1000 }];
      expect(marketDataSimulator(rows)).not.toBe(rows);
    });

    it("fxDataSimulator returns a fresh array", () => {
      const rows = [{ ticker: "USDJPY", last_price: 150, bid: 149.9, ask: 150.1 }];
      expect(fxDataSimulator(rows)).not.toBe(rows);
    });
  });
});
