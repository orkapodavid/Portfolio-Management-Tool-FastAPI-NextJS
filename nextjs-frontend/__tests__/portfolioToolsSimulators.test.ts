import {
  cbInstallmentsSimulator,
  comingResetsSimulator,
  dealIndicationSimulator,
  excessAmountSimulator,
  payToHoldSimulator,
  poSettlementSimulator,
  resetDatesSimulator,
  shortEclSimulator,
  stockBorrowSimulator,
} from "@/lib/grid-simulators/portfolio-tools";

const buildRows = <K extends string>(field: K, value: string) =>
  Array.from({ length: 6 }, (_, i) => ({
    id: i,
    ticker: `T${i}`,
    [field]: value,
  })) as Array<{ id: number; ticker: string } & Record<K, string>>;

describe("portfolio-tools simulators", () => {
  it("payToHoldSimulator keeps comma-decimal formatting on pth_amount", () => {
    const rows = buildRows("pth_amount", "1,000,000.00");
    const next = payToHoldSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(typeof row.pth_amount).toBe("string");
      expect(row.pth_amount).toMatch(/^-?\d{1,3}(,\d{3})*\.\d{2}$/);
    }
  });

  it("stockBorrowSimulator keeps percent suffix on borrow_rate without sign", () => {
    const rows = buildRows("borrow_rate", "5.25%");
    const next = stockBorrowSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(row.borrow_rate).toMatch(/^-?\d+\.\d{2}%$/);
    }
  });

  it("resetDatesSimulator keeps comma-decimal formatting on market_price", () => {
    const rows = buildRows("market_price", "2,345.67");
    const next = resetDatesSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(row.market_price).toMatch(/^-?\d{1,3}(,\d{3})*\.\d{2}$/);
    }
  });

  it("comingResetsSimulator decrements integer-string cal_days by 0 or 1", () => {
    const rows = buildRows("cal_days", "10");
    const next = comingResetsSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      const value = Number(row.cal_days);
      expect(Number.isInteger(value)).toBe(true);
      expect(value === 9 || value === 10).toBe(true);
    }
  });

  it("cbInstallmentsSimulator keeps comma-decimal formatting on installment_amount", () => {
    const rows = buildRows("installment_amount", "500,000.00");
    const next = cbInstallmentsSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(row.installment_amount).toMatch(/^-?\d{1,3}(,\d{3})*\.\d{2}$/);
    }
  });

  it("excessAmountSimulator keeps comma-decimal formatting on excess_amount", () => {
    const rows = buildRows("excess_amount", "1,200,000.00");
    const next = excessAmountSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(row.excess_amount).toMatch(/^-?\d{1,3}(,\d{3})*\.\d{2}$/);
    }
  });

  it("dealIndicationSimulator keeps comma-decimal formatting on indication_amount", () => {
    const rows = buildRows("indication_amount", "750,000.00");
    const next = dealIndicationSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(row.indication_amount).toMatch(/^-?\d{1,3}(,\d{3})*\.\d{2}$/);
    }
  });

  it("poSettlementSimulator keeps comma-decimal formatting on last_price", () => {
    const rows = buildRows("last_price", "1,234.56");
    const next = poSettlementSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(row.last_price).toMatch(/^-?\d{1,3}(,\d{3})*\.\d{2}$/);
    }
  });

  it("shortEclSimulator keeps comma-integer formatting on short_position", () => {
    const rows = buildRows("short_position", "1,000,000");
    const next = shortEclSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const row of next) {
      expect(row.short_position).toMatch(/^-?\d{1,3}(,\d{3})*$/);
    }
  });
});
