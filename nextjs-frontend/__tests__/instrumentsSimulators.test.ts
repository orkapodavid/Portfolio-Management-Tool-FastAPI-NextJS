import {
  instrumentDataSimulator,
  instrumentTermSimulator,
  specialTermsSimulator,
  stockScreenerSimulator,
  tickerDataSimulator,
} from "@/lib/grid-simulators/instruments";

describe("instruments simulators", () => {
  describe("tickerDataSimulator", () => {
    it("returns a fresh array reference", () => {
      const rows = [{ id: 1, ticker: "AAPL", chg_1d_pct: "+1.50%", fx_rate: "1.2345" }];
      const next = tickerDataSimulator(rows);
      expect(next).not.toBe(rows);
    });

    it("formats chg_1d_pct as +/-X.YY%", () => {
      const rows = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        ticker: `T${i}`,
        chg_1d_pct: "+1.50%",
        fx_rate: "1.2345",
      }));
      const next = tickerDataSimulator(rows);
      const changed = next.find((row, i) => row !== rows[i]);
      expect(changed).toBeDefined();
      expect(typeof changed?.chg_1d_pct).toBe("string");
      expect(changed?.chg_1d_pct).toMatch(/^[+-]\d+\.\d{2}%$/);
    });

    it("formats fx_rate as a 4-decimal number string", () => {
      const rows = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        ticker: `T${i}`,
        chg_1d_pct: "+1.50%",
        fx_rate: "1.2345",
      }));
      const next = tickerDataSimulator(rows);
      const changed = next.find((row, i) => row !== rows[i]);
      expect(changed?.fx_rate).toMatch(/^\d+\.\d{4}$/);
    });

    it("returns the same empty array when rows are empty", () => {
      const empty: { ticker?: string }[] = [];
      expect(tickerDataSimulator(empty)).toBe(empty);
    });
  });

  describe("stockScreenerSimulator", () => {
    it("formats last_price and mkt_cap_usd with thousands separator + 2 decimals", () => {
      const rows = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        ticker: `T${i}`,
        last_price: "1,234.56",
        mkt_cap_usd: "10,000.00",
      }));
      const next = stockScreenerSimulator(rows);
      const changed = next.find((row, i) => row !== rows[i]);
      expect(changed).toBeDefined();
      expect(changed?.last_price).toMatch(/^\d{1,3}(,\d{3})*\.\d{2}$/);
      expect(changed?.mkt_cap_usd).toMatch(/^\d{1,3}(,\d{3})*\.\d{2}$/);
    });

    it("does not modify rows with empty fields", () => {
      const rows = [{ id: 1, ticker: "X", last_price: "", mkt_cap_usd: "" }];
      const next = stockScreenerSimulator(rows);
      expect(next[0].last_price).toBe("");
      expect(next[0].mkt_cap_usd).toBe("");
    });
  });

  describe("specialTermsSimulator", () => {
    it("formats position as integer with thousands separators", () => {
      const rows = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        ticker: `T${i}`,
        position: "10,000",
      }));
      const next = specialTermsSimulator(rows);
      const changed = next.find((row, i) => row !== rows[i]);
      expect(changed).toBeDefined();
      expect(changed?.position).toMatch(/^-?\d{1,3}(,\d{3})*$/);
    });

    it("returns the same array when rows are empty", () => {
      const empty: { position?: string }[] = [];
      expect(specialTermsSimulator(empty)).toBe(empty);
    });
  });

  describe("instrumentDataSimulator + instrumentTermSimulator", () => {
    it("instrumentDataSimulator emits a fresh array reference", () => {
      const rows = [{ id: 1, ticker: "X" }];
      expect(instrumentDataSimulator(rows)).not.toBe(rows);
    });

    it("instrumentTermSimulator emits a fresh array reference", () => {
      const rows = [{ id: 1, ticker: "X" }];
      expect(instrumentTermSimulator(rows)).not.toBe(rows);
    });

    it("instrumentDataSimulator does not change field values", () => {
      const rows = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        ticker: `T${i}`,
        company_name: `Company ${i}`,
      }));
      const next = instrumentDataSimulator(rows);
      // Even if the row reference changes, every field must be equal.
      next.forEach((row, i) => {
        expect(row.id).toBe(rows[i].id);
        expect(row.ticker).toBe(rows[i].ticker);
        expect(row.company_name).toBe(rows[i].company_name);
      });
    });

    it("instrumentTermSimulator does not change field values", () => {
      const rows = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        ticker: `T${i}`,
        maturity_date: `2030-01-${String(i + 1).padStart(2, "0")}`,
      }));
      const next = instrumentTermSimulator(rows);
      next.forEach((row, i) => {
        expect(row.id).toBe(rows[i].id);
        expect(row.ticker).toBe(rows[i].ticker);
        expect(row.maturity_date).toBe(rows[i].maturity_date);
      });
    });
  });
});
