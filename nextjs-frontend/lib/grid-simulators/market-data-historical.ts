type GridRow = Record<string, unknown>;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const toFloat = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const jitterPriceField = <TRow extends GridRow>(
  row: TRow,
  field: string,
): TRow => {
  if (!(field in row)) return row;
  const current = row[field];
  const numeric = toFloat(current);
  if (numeric === null || numeric === 0) return row;
  const factor = 0.99 + Math.random() * (1.01 - 0.99);
  const next = Math.round(numeric * factor * 100) / 100;
  return {
    ...row,
    [field]: typeof current === "number" ? next : next.toFixed(2),
  } as TRow;
};

/**
 * Reflex parity port of
 * `HistoricalDataMixin.simulate_historical_update`.
 *
 * On 1..min(3, len) random rows, jitters `close`, `high`, and `low`
 * price fields by a uniform `[0.99, 1.01]` factor (rounded to 2dp).
 * Fields that are missing or zero/empty are left untouched. The
 * Reflex mixin runs at a 5-second cadence — pages should pass
 * `simulateUpdateIntervalMs={5_000}` alongside this simulator.
 */
export const historicalDataSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] => {
  if (rows.length === 0) return rows;

  const next = [...rows];
  const updates = randomInt(1, Math.min(3, next.length));
  for (let i = 0; i < updates; i += 1) {
    const idx = randomInt(0, next.length - 1);
    let row = next[idx];
    if (!row) continue;
    row = jitterPriceField(row, "close");
    row = jitterPriceField(row, "high");
    row = jitterPriceField(row, "low");
    next[idx] = row;
  }
  return next;
};
