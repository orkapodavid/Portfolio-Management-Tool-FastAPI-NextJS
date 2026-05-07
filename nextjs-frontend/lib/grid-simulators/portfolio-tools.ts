type GridRow = Record<string, unknown>;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const formatCommaDecimal = (value: number, decimals: number): string =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const formatCommaInteger = (value: number): string =>
  value.toLocaleString("en-US", { maximumFractionDigits: 0 });

/**
 * Generic Reflex-parity helper: pick 1..numRows random rows and run the
 * supplied `jitter` callback against the row's `field`. Returns a new
 * array reference so AG Grid sees a refreshable diff. Untouched rows
 * keep their original reference.
 */
const jitterFieldOnRandomRows = <TRow extends GridRow>(
  rows: TRow[],
  field: string,
  jitter: (current: string) => string,
  numRows = 3,
): TRow[] => {
  if (rows.length === 0) return rows;
  const next = [...rows];
  const count = randomInt(1, Math.min(numRows, next.length));
  const picked = new Set<number>();
  while (picked.size < count) {
    picked.add(randomInt(0, next.length - 1));
  }
  for (const idx of picked) {
    const original = next[idx];
    if (!original) continue;
    const value = original[field];
    if (typeof value !== "string" || value === "") continue;
    next[idx] = { ...original, [field]: jitter(value) } as TRow;
  }
  return next;
};

const jitterCommaDecimal = (
  raw: string,
  jitterMin: number,
  jitterMax: number,
  decimals = 2,
): string => {
  const cleaned = raw.replace(/,/g, "").trim();
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return raw;
  const factor = jitterMin + Math.random() * (jitterMax - jitterMin);
  const next =
    Math.round(parsed * factor * 10 ** decimals) / 10 ** decimals;
  return formatCommaDecimal(next, decimals);
};

const jitterPercentPlain = (
  raw: string,
  jitterMin: number,
  jitterMax: number,
): string => {
  const cleaned = raw.replace(/%/g, "").trim();
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return raw;
  const factor = jitterMin + Math.random() * (jitterMax - jitterMin);
  const next = Math.round(parsed * factor * 100) / 100;
  return `${next.toFixed(2)}%`;
};

const jitterCommaInteger = (
  raw: string,
  jitterMin: number,
  jitterMax: number,
): string => {
  const cleaned = raw.replace(/,/g, "").trim();
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return raw;
  const factor = jitterMin + Math.random() * (jitterMax - jitterMin);
  const next = Math.trunc(parsed * factor);
  return formatCommaInteger(next);
};

const jitterCountdownInteger = (raw: string): string => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return raw;
  return String(parsed - randomInt(0, 1));
};

/**
 * Reflex parity port of `PayToHoldMixin.simulate_pay_to_hold_update` —
 * jitters comma-formatted `pth_amount` ±2% on 1-3 random rows.
 */
export const payToHoldSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  jitterFieldOnRandomRows(rows, "pth_amount", (raw) =>
    jitterCommaDecimal(raw, 0.98, 1.02),
  );

/**
 * Reflex parity port of `StockBorrowMixin.simulate_stock_borrow_update` —
 * jitters percentage-formatted `borrow_rate` ±5% on 1-3 random rows
 * (e.g. `5.25%` → `5.34%`).
 */
export const stockBorrowSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  jitterFieldOnRandomRows(rows, "borrow_rate", (raw) =>
    jitterPercentPlain(raw, 0.95, 1.05),
  );

/**
 * Reflex parity port of `ResetDatesMixin.simulate_reset_dates_update` —
 * jitters comma-formatted `market_price` ±0.5% on 1-3 random rows.
 */
export const resetDatesSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  jitterFieldOnRandomRows(rows, "market_price", (raw) =>
    jitterCommaDecimal(raw, 0.995, 1.005),
  );

/**
 * Reflex parity port of `ComingResetsMixin.simulate_coming_resets_update` —
 * decrements integer-string `cal_days` by 0 or 1 on 1-3 random rows.
 */
export const comingResetsSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  jitterFieldOnRandomRows(rows, "cal_days", jitterCountdownInteger);

/**
 * Reflex parity port of `CBInstallmentsMixin.simulate_cb_installments_update` —
 * jitters comma-formatted `installment_amount` ±2% on 1-3 random rows.
 */
export const cbInstallmentsSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  jitterFieldOnRandomRows(rows, "installment_amount", (raw) =>
    jitterCommaDecimal(raw, 0.98, 1.02),
  );

/**
 * Reflex parity port of `ExcessAmountMixin.simulate_excess_amount_update` —
 * jitters comma-formatted `excess_amount` ±5% on 1-3 random rows.
 */
export const excessAmountSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  jitterFieldOnRandomRows(rows, "excess_amount", (raw) =>
    jitterCommaDecimal(raw, 0.95, 1.05),
  );

/**
 * Reflex parity port of `DealIndicationMixin.simulate_deal_indication_update` —
 * jitters comma-formatted `indication_amount` ±2% on 1-3 random rows.
 */
export const dealIndicationSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  jitterFieldOnRandomRows(rows, "indication_amount", (raw) =>
    jitterCommaDecimal(raw, 0.98, 1.02),
  );

/**
 * Reflex parity port of `POSettlementMixin.simulate_po_settlement_update` —
 * jitters comma-formatted `last_price` ±0.5% on 1-3 random rows.
 */
export const poSettlementSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  jitterFieldOnRandomRows(rows, "last_price", (raw) =>
    jitterCommaDecimal(raw, 0.995, 1.005),
  );

/**
 * Reflex parity port of `ShortECLMixin.simulate_short_ecl_update` —
 * jitters comma-formatted integer `short_position` ±2% on 1-3 random rows.
 */
export const shortEclSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  jitterFieldOnRandomRows(rows, "short_position", (raw) =>
    jitterCommaInteger(raw, 0.98, 1.02),
  );
