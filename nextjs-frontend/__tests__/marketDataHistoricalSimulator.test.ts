import { historicalDataSimulator } from "@/lib/grid-simulators/market-data-historical";

describe("historicalDataSimulator", () => {
  it("returns the same array when there are no rows", () => {
    const empty: { close?: number }[] = [];
    expect(historicalDataSimulator(empty)).toBe(empty);
  });

  it("returns a fresh array and jitters close/high/low within a tight band", () => {
    // Use a large base so that compound jittering (a single row may be
    // selected up to 3 times per call) still stays well within ±5%.
    const rows = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      ticker: `T${i}`,
      close: 100,
      high: 101,
      low: 99,
    }));
    const next = historicalDataSimulator(rows);
    expect(next).not.toBe(rows);
    expect(next).toHaveLength(rows.length);

    for (const row of next) {
      const r = row as { close: number; high: number; low: number };
      // ±5% accounts for up to 3 compounded ±1% jitters on the same row.
      expect(r.close).toBeGreaterThanOrEqual(95);
      expect(r.close).toBeLessThanOrEqual(105);
      expect(r.high).toBeGreaterThanOrEqual(95.95);
      expect(r.high).toBeLessThanOrEqual(106.05);
      expect(r.low).toBeGreaterThanOrEqual(94.05);
      expect(r.low).toBeLessThanOrEqual(103.95);
    }
  });

  it("preserves number type when the field came in as a number", () => {
    const rows = [{ id: 1, ticker: "X", close: 100, high: 101, low: 99 }];
    const next = historicalDataSimulator(rows);
    const r = next[0] as { close: number; high: number; low: number };
    expect(typeof r.close).toBe("number");
    expect(typeof r.high).toBe("number");
    expect(typeof r.low).toBe("number");
  });

  it("formats string-typed fields with 2 decimal places", () => {
    const rows = [{ id: 1, ticker: "X", close: "100", high: "101", low: "99" }];
    const next = historicalDataSimulator(rows);
    const r = next[0] as { close: string; high: string; low: string };
    expect(typeof r.close).toBe("string");
    expect(r.close).toMatch(/^\d+\.\d{2}$/);
    expect(r.high).toMatch(/^\d+\.\d{2}$/);
    expect(r.low).toMatch(/^\d+\.\d{2}$/);
  });

  it("leaves zero/empty price fields untouched", () => {
    const rows = [{ id: 1, ticker: "X", close: 0, high: 0, low: 0 }];
    const next = historicalDataSimulator(rows);
    const r = next[0] as { close: number; high: number; low: number };
    expect(r.close).toBe(0);
    expect(r.high).toBe(0);
    expect(r.low).toBe(0);
  });
});
