import { simulateFinancialTick } from "@/lib/grid-simulators";

type GridRow = Record<string, unknown>;

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Reflex parity port of `pnl_change_mixin.simulate_pnl_change_update`.
 * Jitters dollar-formatted PnL fields and percent-formatted change fields.
 */
export const pnlChangeSimulator = <TRow extends GridRow>(rows: TRow[]): TRow[] =>
  simulateFinancialTick(rows, {
    valueFields: ["pnl_chg_1d", "pnl_chg_1w", "pnl_chg_1m", "pnl_ytd"],
    pctFields: ["pnl_chg_pct_1d", "pnl_chg_pct_1w", "pnl_chg_pct_1m"],
  });

/**
 * Reflex parity port of `pnl_full_mixin.simulate_pnl_full_update`.
 * Wider jitter (0.97–1.03) and up to 5 rows per tick. No percent fields.
 */
export const pnlFullSimulator = <TRow extends GridRow>(rows: TRow[]): TRow[] =>
  simulateFinancialTick(rows, {
    valueFields: ["pnl_ytd", "pnl_chg_1d", "pnl_chg_1w", "pnl_chg_1m"],
    numRows: 5,
    valueJitter: [0.97, 1.03],
  });

/**
 * Jitter a comma-formatted plain decimal string (e.g. "2,876.50") in place.
 * Preserves the comma-thousands formatting Reflex emits for `price`.
 */
const jitterCommaDecimal = (
  raw: string,
  jitterMin: number,
  jitterMax: number,
  decimals: number,
): string => {
  const cleaned = raw.replace(/,/g, "").trim();
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return raw;
  const factor = jitterMin + Math.random() * (jitterMax - jitterMin);
  const next = Math.round(parsed * factor * 10 ** decimals) / 10 ** decimals;
  return next.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Jitter a fixed-decimal numeric string (e.g. "0.7923") preserving the
 * decimal width. Used for `fx_rate`.
 */
const jitterFixedDecimal = (
  raw: string,
  jitterMin: number,
  jitterMax: number,
  decimals: number,
): string => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return raw;
  const factor = jitterMin + Math.random() * (jitterMax - jitterMin);
  const next = parsed * factor;
  return next.toFixed(decimals);
};

/**
 * Reflex parity port of `pnl_summary_mixin.simulate_pnl_summary_update`.
 * Updates 1–3 random rows; jitters `price` (0.995–1.005, comma-formatted)
 * and `fx_rate` (0.9999–1.0001, 4 decimals).
 */
export const pnlSummarySimulator = <TRow extends GridRow>(rows: TRow[]): TRow[] => {
  if (rows.length === 0) return rows;
  const next = [...rows];
  const count = randomInt(1, Math.min(3, next.length));
  for (let i = 0; i < count; i += 1) {
    const idx = randomInt(0, next.length - 1);
    const original = next[idx];
    if (!original) continue;
    const updated = { ...original } as TRow;
    const price = updated.price;
    if (typeof price === "string" && price !== "") {
      (updated as Record<string, unknown>).price = jitterCommaDecimal(
        price,
        0.995,
        1.005,
        2,
      );
    }
    const fxRate = updated.fx_rate;
    if (typeof fxRate === "string" && fxRate !== "") {
      (updated as Record<string, unknown>).fx_rate = jitterFixedDecimal(
        fxRate,
        0.9999,
        1.0001,
        4,
      );
    }
    next[idx] = updated;
  }
  return next;
};

/**
 * Reflex parity port of `pnl_currency_mixin.simulate_pnl_currency_update`.
 * Updates 1–3 random rows; jitters `fx_rate` (0.999–1.001, 4 decimals).
 */
export const pnlCurrencySimulator = <TRow extends GridRow>(rows: TRow[]): TRow[] => {
  if (rows.length === 0) return rows;
  const next = [...rows];
  const count = randomInt(1, Math.min(3, next.length));
  for (let i = 0; i < count; i += 1) {
    const idx = randomInt(0, next.length - 1);
    const original = next[idx];
    if (!original) continue;
    const updated = { ...original } as TRow;
    const fxRate = updated.fx_rate;
    if (typeof fxRate === "string" && fxRate !== "") {
      (updated as Record<string, unknown>).fx_rate = jitterFixedDecimal(
        fxRate,
        0.999,
        1.001,
        4,
      );
    }
    next[idx] = updated;
  }
  return next;
};
