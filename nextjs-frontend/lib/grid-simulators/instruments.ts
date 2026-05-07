type GridRow = Record<string, unknown>;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number) =>
  min + Math.random() * (max - min);

/**
 * Apply 1..numRows immutable updates to randomly selected rows. Mirrors the
 * Reflex `for _ in range(random.randint(1, min(numRows, len(rows))))` loop.
 */
const updateRandomRows = <TRow extends GridRow>(
  rows: TRow[],
  numRows: number,
  mutate: (row: TRow) => TRow,
): TRow[] => {
  if (rows.length === 0) return rows;
  const next = [...rows];
  const count = randomInt(1, Math.min(numRows, next.length));
  for (let i = 0; i < count; i += 1) {
    const idx = randomInt(0, next.length - 1);
    const original = next[idx];
    if (!original) continue;
    next[idx] = mutate(original);
  }
  return next;
};

/**
 * Reflex parity port of `TickerDataMixin.simulate_ticker_data_update` —
 * jitters `chg_1d_pct` (formatted `+1.23%`) ±10% and `fx_rate`
 * (formatted `1.2345`) ±0.01% on 1-3 random rows.
 */
export const tickerDataSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  updateRandomRows(rows, 3, (row) => {
    const next = { ...row } as TRow;
    const pct = next["chg_1d_pct"];
    if (typeof pct === "string" && pct !== "") {
      const cleaned = pct.replace(/%/g, "").replace(/\+/g, "");
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        const value = Math.round(parsed * randomFloat(0.9, 1.1) * 100) / 100;
        const sign = value >= 0 ? "+" : "";
        (next as Record<string, unknown>)["chg_1d_pct"] =
          `${sign}${value.toFixed(2)}%`;
      }
    }
    const fx = next["fx_rate"];
    if (typeof fx === "string" && fx !== "") {
      const cleaned = fx.replace(/,/g, "");
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        const value =
          Math.round(parsed * randomFloat(0.9999, 1.0001) * 10000) / 10000;
        (next as Record<string, unknown>)["fx_rate"] = value.toFixed(4);
      }
    }
    return next;
  });

/**
 * Reflex parity port of
 * `StockScreenerMixin.simulate_stock_screener_update` — jitters
 * `last_price` (formatted `1,234.56`) ±0.5% and `mkt_cap_usd`
 * (formatted `1,234.56`) ±1% on 1-3 random rows.
 */
export const stockScreenerSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  updateRandomRows(rows, 3, (row) => {
    const next = { ...row } as TRow;
    const lp = next["last_price"];
    if (typeof lp === "string" && lp !== "") {
      const cleaned = lp.replace(/,/g, "");
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        const value =
          Math.round(parsed * randomFloat(0.995, 1.005) * 100) / 100;
        (next as Record<string, unknown>)["last_price"] = value.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        );
      }
    }
    const cap = next["mkt_cap_usd"];
    if (typeof cap === "string" && cap !== "") {
      const cleaned = cap.replace(/,/g, "");
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        const value = Math.round(parsed * randomFloat(0.99, 1.01) * 100) / 100;
        (next as Record<string, unknown>)["mkt_cap_usd"] = value.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        );
      }
    }
    return next;
  });

/**
 * Reflex parity port of `SpecialTermsMixin.simulate_special_terms_update` —
 * jitters integer `position` (formatted `1,234`) ±2% on 1-3 random rows.
 */
export const specialTermsSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  updateRandomRows(rows, 3, (row) => {
    const next = { ...row } as TRow;
    const position = next["position"];
    if (typeof position === "string" && position !== "") {
      const cleaned = position.replace(/,/g, "");
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        // Reflex uses `int(val * uniform(0.98, 1.02))` which truncates.
        const value = Math.trunc(parsed * randomFloat(0.98, 1.02));
        (next as Record<string, unknown>)["position"] =
          value.toLocaleString("en-US");
      }
    }
    return next;
  });

/**
 * Reflex parity port of
 * `InstrumentDataMixin.simulate_instrument_data_update` — emits a fresh row
 * reference for 1-3 random rows so AG Grid re-flashes those cells, but does
 * not change any field values.
 */
export const instrumentDataSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] => updateRandomRows(rows, 3, (row) => ({ ...row }));

/**
 * Reflex parity port of
 * `InstrumentTermsMixin.simulate_instrument_terms_update` — emits a fresh
 * row reference for 1-3 random rows without changing field values.
 */
export const instrumentTermSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] => updateRandomRows(rows, 3, (row) => ({ ...row }));
