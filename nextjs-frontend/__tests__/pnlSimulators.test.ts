import {
  pnlChangeSimulator,
  pnlCurrencySimulator,
  pnlFullSimulator,
  pnlSummarySimulator,
} from "@/lib/grid-simulators/pnl";

describe("PnL grid simulators", () => {
  let randomSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    // Force every Math.random() call to 0.5 so we deterministically pick:
    //   - randomInt(min, max) → midpoint (always selects an in-range index)
    //   - jitter factor → midpoint of [min, max] (≠ 1.0 → values change)
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe("pnlChangeSimulator", () => {
    it("returns a fresh array reference and mutates a value field", () => {
      const rows = Array.from({ length: 4 }, (_, i) => ({
        ticker: `T${i}`,
        pnl_ytd: "$10,000.00",
        pnl_chg_1d: "$100.00",
        pnl_chg_1w: "$200.00",
        pnl_chg_1m: "$300.00",
        pnl_chg_pct_1d: "+1.5%",
        pnl_chg_pct_1w: "+2.0%",
        pnl_chg_pct_1m: "+3.0%",
      }));
      const next = pnlChangeSimulator(rows);
      expect(next).not.toBe(rows);
      const changed = next.filter((row, i) => row !== rows[i]);
      expect(changed.length).toBeGreaterThan(0);
    });
  });

  describe("pnlFullSimulator", () => {
    it("returns a fresh array reference and mutates a value field", () => {
      const rows = Array.from({ length: 4 }, (_, i) => ({
        ticker: `T${i}`,
        pnl_ytd: "$66,846.76",
        pnl_chg_1d: "$1,234.56",
        pnl_chg_1w: "$2,345.67",
        pnl_chg_1m: "$3,456.78",
      }));
      const next = pnlFullSimulator(rows);
      expect(next).not.toBe(rows);
      const changed = next.filter((row, i) => row !== rows[i]);
      expect(changed.length).toBeGreaterThan(0);
    });
  });

  describe("pnlSummarySimulator", () => {
    it("returns a fresh array reference and mutates the price field", () => {
      const rows = Array.from({ length: 4 }, (_, i) => ({
        underlying: `U${i}`,
        price: "2,876.50",
        fx_rate: "0.7234",
      }));
      const next = pnlSummarySimulator(rows);
      expect(next).not.toBe(rows);
      const changed = next.filter((row, i) => row !== rows[i]);
      expect(changed.length).toBeGreaterThan(0);
      // Comma-formatted price stays comma-formatted (preserves Reflex output).
      const updated = changed[0] as { price: string; fx_rate: string };
      expect(updated.price).toMatch(/^\d{1,3}(?:,\d{3})*\.\d{2}$/);
      expect(updated.fx_rate).toMatch(/^\d+\.\d{4}$/);
    });

    it("returns the same array reference when given an empty list", () => {
      const empty: { price?: string }[] = [];
      expect(pnlSummarySimulator(empty)).toBe(empty);
    });
  });

  describe("pnlCurrencySimulator", () => {
    it("returns a fresh array reference and mutates the fx_rate field", () => {
      const rows = Array.from({ length: 4 }, (_, i) => ({
        currency: `C${i}`,
        fx_rate: "0.7234",
      }));
      const next = pnlCurrencySimulator(rows);
      expect(next).not.toBe(rows);
      const changed = next.filter((row, i) => row !== rows[i]);
      expect(changed.length).toBeGreaterThan(0);
      const updated = changed[0] as { fx_rate: string };
      expect(updated.fx_rate).toMatch(/^\d+\.\d{4}$/);
    });
  });
});
