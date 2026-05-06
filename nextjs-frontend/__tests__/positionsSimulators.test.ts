import {
  bondPositionsSimulator,
  positionsSimulator,
  stockPositionSimulator,
  tradeSummarySimulator,
  warrantPositionSimulator,
} from "@/lib/grid-simulators/positions";

const buildPositionsRows = () =>
  Array.from({ length: 6 }, (_, i) => ({
    id: i,
    ticker: `T${i}`,
    notional: "$300,000.00",
  }));

const buildAlphanumericRows = (prefix: string) =>
  Array.from({ length: 6 }, (_, i) => ({
    id: i,
    ticker: `T${i}`,
    detail_id: `${prefix}${String(i + 1).padStart(3, "0")}`,
  }));

const buildTradeSummaryRows = () =>
  Array.from({ length: 6 }, (_, i) => ({
    id: i,
    ticker: `T${i}`,
    divisor: "1.0000",
  }));

describe("positions simulators", () => {
  it("positionsSimulator returns a fresh array and mutates at least one row", () => {
    const rows = buildPositionsRows();
    const next = positionsSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
  });

  it("stockPositionSimulator preserves dollar formatting on notional", () => {
    const rows = buildPositionsRows();
    const next = stockPositionSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(typeof row.notional).toBe("string");
      expect(row.notional).toMatch(/^-?\$/);
    }
  });

  it("warrantPositionSimulator jitters alphanumeric detail_id with prefix preserved", () => {
    const rows = buildAlphanumericRows("WD");
    const next = warrantPositionSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(row.detail_id).toMatch(/^WD\d{3}$/);
    }
  });

  it("bondPositionsSimulator jitters alphanumeric detail_id with prefix preserved", () => {
    const rows = buildAlphanumericRows("BD");
    const next = bondPositionsSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(row.detail_id).toMatch(/^BD\d{3}$/);
    }
  });

  it("tradeSummarySimulator jitters numeric-string divisor and keeps it stringy", () => {
    const rows = buildTradeSummaryRows();
    const next = tradeSummarySimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(typeof row.divisor).toBe("string");
      expect(row.divisor).toMatch(/^-?\d+\.\d+$/);
    }
  });
});
