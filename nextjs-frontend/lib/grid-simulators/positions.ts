import {
  simulateFinancialTick,
  simulateNumericTick,
} from "@/lib/grid-simulators";

type GridRow = Record<string, unknown>;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Mutate an alphanumeric ID like `WD004` or `BD012` by ±1 on the numeric
 * suffix while keeping the prefix and zero-padding intact. Mirrors the
 * Reflex `parse_alphanumeric_id` helper used by warrant + bond positions.
 */
const jitterAlphanumericId = (raw: string): string => {
  const match = /^([A-Za-z]*)(\d+)$/.exec(raw);
  if (!match) return raw;
  const [, prefix, digits] = match;
  const num = Number(digits);
  if (!Number.isFinite(num)) return raw;
  const padding = digits.length;
  const next = Math.max(0, num + randomInt(-1, 1));
  return `${prefix}${String(next).padStart(padding, "0")}`;
};

const simulateAlphanumericIdTick = <TRow extends GridRow>(
  rows: TRow[],
  field: string,
  numRows = 3,
): TRow[] => {
  if (rows.length === 0) return rows;
  const next = [...rows];
  const count = randomInt(1, Math.min(numRows, next.length));
  for (let i = 0; i < count; i += 1) {
    const idx = randomInt(0, next.length - 1);
    const original = next[idx];
    if (!original) continue;
    const value = original[field];
    if (typeof value !== "string" || value === "") continue;
    next[idx] = { ...original, [field]: jitterAlphanumericId(value) } as TRow;
  }
  return next;
};

/**
 * Reflex parity port of `PositionsMixin.simulate_positions_update` —
 * jitters `notional` ±1% on 1-3 random rows.
 */
export const positionsSimulator = <TRow extends GridRow>(rows: TRow[]): TRow[] =>
  simulateFinancialTick(rows, {
    valueFields: ["notional"],
    numRows: 3,
    valueJitter: [0.99, 1.01],
  });

/**
 * Reflex parity port of `StockPositionMixin.simulate_stock_positions_update` —
 * jitters dollar-formatted `notional` ±1% on 1-3 random rows.
 */
export const stockPositionSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  simulateFinancialTick(rows, {
    valueFields: ["notional"],
    numRows: 3,
    valueJitter: [0.99, 1.01],
  });

/**
 * Reflex parity port of `WarrantPositionMixin.simulate_warrant_positions_update` —
 * jitters alphanumeric `detail_id` (e.g. `WD004` → `WD003`/`WD005`) on 1-3
 * random rows.
 */
export const warrantPositionSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] => simulateAlphanumericIdTick(rows, "detail_id", 3);

/**
 * Reflex parity port of `BondPositionsMixin.simulate_bond_positions_update` —
 * jitters alphanumeric `detail_id` (e.g. `BD004` → `BD003`/`BD005`) on 1-3
 * random rows.
 */
export const bondPositionsSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] => simulateAlphanumericIdTick(rows, "detail_id", 3);

/**
 * Reflex parity port of `TradeSummaryMixin.simulate_trade_summary_update` —
 * jitters numeric-string `divisor` ±1% (4 decimals) on 1-3 random rows.
 */
export const tradeSummarySimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  simulateNumericTick(rows, {
    fields: ["divisor"],
    numRows: 3,
    jitter: [0.99, 1.01],
    decimals: 4,
  });
