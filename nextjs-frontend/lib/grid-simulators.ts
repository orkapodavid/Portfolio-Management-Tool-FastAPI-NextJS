type GridRow = Record<string, unknown>;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatLike = (original: unknown, next: number, decimals: number) => {
  const rounded = Number(next.toFixed(decimals));
  return typeof original === "number" ? rounded : rounded.toFixed(decimals);
};

const formatIntLike = (original: unknown, next: number) => {
  const rounded = Math.round(next);
  return typeof original === "number" ? rounded : String(rounded);
};

const updateDecimalField = <TRow extends GridRow>(
  row: TRow,
  field: string,
  factorMin: number,
  factorMax: number,
  decimals: number,
): TRow => {
  const current = row[field];
  const numeric = toNumber(current);
  if (numeric === null) return row;
  const factor = factorMin + Math.random() * (factorMax - factorMin);
  return { ...row, [field]: formatLike(current, numeric * factor, decimals) };
};

const updateRandomRangeField = <TRow extends GridRow>(
  row: TRow,
  field: string,
  min: number,
  max: number,
  decimals: number,
): TRow => {
  if (!(field in row)) return row;
  const current = row[field];
  const next = min + Math.random() * (max - min);
  return { ...row, [field]: formatLike(current, next, decimals) };
};

const updateIntegerField = <TRow extends GridRow>(
  row: TRow,
  field: string,
  factorMin: number,
  factorMax: number,
): TRow => {
  const current = row[field];
  const numeric = toNumber(current);
  if (numeric === null) return row;
  const factor = factorMin + Math.random() * (factorMax - factorMin);
  return { ...row, [field]: formatIntLike(current, numeric * factor) };
};

export const marketDataSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] => {
  if (rows.length === 0) return rows;

  const nextRows = [...rows];
  const updates = randomInt(1, Math.min(5, rows.length));
  for (let i = 0; i < updates; i += 1) {
    const idx = randomInt(0, rows.length - 1);
    let row = nextRows[idx];
    if (!row) continue;
    row = updateDecimalField(row, "last_price", 0.99, 1.01, 2);
    row = updateRandomRangeField(row, "chg_1d_pct", -5, 5, 2);
    row = updateIntegerField(row, "last_volume", 0.98, 1.02);
    nextRows[idx] = row;
  }
  return nextRows;
};

export const fxDataSimulator = <TRow extends GridRow>(rows: TRow[]): TRow[] => {
  if (rows.length === 0) return rows;

  const nextRows = [...rows];
  const updates = randomInt(1, Math.min(5, rows.length));
  for (let i = 0; i < updates; i += 1) {
    const idx = randomInt(0, rows.length - 1);
    let row = nextRows[idx];
    if (!row) continue;
    row = updateDecimalField(row, "last_price", 0.999, 1.001, 5);
    row = updateDecimalField(row, "bid", 0.999, 1.001, 5);
    row = updateDecimalField(row, "ask", 0.999, 1.001, 5);
    nextRows[idx] = row;
  }
  return nextRows;
};

// --- Reflex-parity utilities (ported from
// Portfolio-Management-Tool-reflex/app/utils/simulation.py) -------------

const jitterDollarValue = (
  raw: string,
  jitterMin: number,
  jitterMax: number,
): string => {
  const isNegative = raw.includes("(") || raw.trim().startsWith("-");
  const cleaned = raw
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/[()]/g, "")
    .replace(/^-/, "")
    .trim();
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return raw;
  const factor = jitterMin + Math.random() * (jitterMax - jitterMin);
  let next = Math.round(parsed * factor * 100) / 100;
  if (isNegative) next = -next;
  if (next < 0) {
    return `-$${Math.abs(next).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${next.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const jitterPctValue = (
  raw: string,
  jitterMin: number,
  jitterMax: number,
): string => {
  const cleaned = raw.replace(/%/g, "").replace(/\+/g, "");
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return raw;
  const factor = jitterMin + Math.random() * (jitterMax - jitterMin);
  const next = Math.round(parsed * factor * 100) / 100;
  const sign = next > 0 ? "+" : "";
  return `${sign}${next.toFixed(1)}%`;
};

export type FinancialTickOptions = {
  valueFields: string[];
  pctFields?: string[];
  numRows?: number;
  valueJitter?: [number, number];
  pctJitter?: [number, number];
};

/**
 * Reflex parity port of `simulate_financial_tick`. Mutates 1..numRows random
 * rows in place by jittering dollar-formatted strings (`$1,234.56`) in
 * `valueFields` and percentage-formatted strings (`+1.5%`) in `pctFields`.
 * Returns a new array reference; unchanged rows keep their original
 * reference so AG Grid's row reconciliation stays cheap.
 */
export const simulateFinancialTick = <TRow extends GridRow>(
  rows: TRow[],
  options: FinancialTickOptions,
): TRow[] => {
  if (rows.length === 0) return rows;
  const {
    valueFields,
    pctFields = [],
    numRows = 5,
    valueJitter = [0.95, 1.05],
    pctJitter = [0.9, 1.1],
  } = options;

  const next = [...rows];
  const count = randomInt(1, Math.min(numRows, next.length));
  for (let i = 0; i < count; i += 1) {
    const idx = randomInt(0, next.length - 1);
    const original = next[idx];
    if (!original) continue;
    const updated = { ...original } as TRow;
    for (const field of valueFields) {
      const value = updated[field];
      if (typeof value === "string" && value !== "") {
        (updated as Record<string, unknown>)[field] = jitterDollarValue(
          value,
          valueJitter[0],
          valueJitter[1],
        );
      }
    }
    for (const field of pctFields) {
      const value = updated[field];
      if (typeof value === "string" && value !== "") {
        (updated as Record<string, unknown>)[field] = jitterPctValue(
          value,
          pctJitter[0],
          pctJitter[1],
        );
      }
    }
    next[idx] = updated;
  }
  return next;
};

export type NumericTickOptions = {
  fields: string[];
  numRows?: number;
  jitter?: [number, number];
  decimals?: number;
};

/**
 * Reflex parity port of `simulate_numeric_tick`. Mutates 1..numRows random
 * rows in place by jittering raw numeric (or numeric-string) fields. Used
 * for risk Greeks and other non-formatted numbers.
 */
export const simulateNumericTick = <TRow extends GridRow>(
  rows: TRow[],
  options: NumericTickOptions,
): TRow[] => {
  if (rows.length === 0) return rows;
  const { fields, numRows = 3, jitter = [0.98, 1.02], decimals = 4 } = options;

  const next = [...rows];
  const count = randomInt(1, Math.min(numRows, next.length));
  for (let i = 0; i < count; i += 1) {
    const idx = randomInt(0, next.length - 1);
    const original = next[idx];
    if (!original) continue;
    const updated = { ...original } as TRow;
    for (const field of fields) {
      const value = updated[field];
      const numeric = toNumber(value);
      if (numeric === null) continue;
      const factor = jitter[0] + Math.random() * (jitter[1] - jitter[0]);
      const rounded =
        Math.round(numeric * factor * 10 ** decimals) / 10 ** decimals;
      (updated as Record<string, unknown>)[field] =
        typeof value === "number" ? rounded : rounded.toFixed(decimals);
    }
    next[idx] = updated;
  }
  return next;
};
