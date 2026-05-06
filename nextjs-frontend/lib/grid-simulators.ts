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
  decimals: number
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
  decimals: number
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
  factorMax: number
): TRow => {
  const current = row[field];
  const numeric = toNumber(current);
  if (numeric === null) return row;
  const factor = factorMin + Math.random() * (factorMax - factorMin);
  return { ...row, [field]: formatIntLike(current, numeric * factor) };
};

export const marketDataSimulator = <TRow extends GridRow>(rows: TRow[]): TRow[] => {
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
