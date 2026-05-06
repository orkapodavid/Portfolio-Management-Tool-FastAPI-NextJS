import { simulateNumericTick } from "@/lib/grid-simulators";

type GridRow = Record<string, unknown>;

/**
 * Reflex parity port of `DeltaChangeMixin.simulate_delta_change_update` —
 * jitters Greek fields (delta, gamma, vega, theta) ±1% on 1-3 random rows
 * via `simulate_numeric_tick`. Field list mirrors the Reflex mixin exactly,
 * even when the underlying row shape doesn't actually carry these keys.
 */
export const deltaChangeSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  simulateNumericTick(rows, {
    fields: ["delta", "gamma", "vega", "theta"],
    numRows: 3,
    jitter: [0.99, 1.01],
    decimals: 4,
  });

/**
 * Reflex parity port of `RiskMeasuresMixin.simulate_risk_measures_update` —
 * jitters spot_price/fx_rate plus delta/gamma/vega/theta ±1% on 1-3 random
 * rows. Mirrors the Reflex field list verbatim.
 */
export const riskMeasuresSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  simulateNumericTick(rows, {
    fields: ["spot_price", "fx_rate", "delta", "gamma", "vega", "theta"],
    numRows: 3,
    jitter: [0.99, 1.01],
    decimals: 4,
  });

/**
 * Reflex parity port of `RiskInputsMixin.simulate_risk_inputs_update` —
 * jitters spot_price/volatility/interest_rate/dividend_yield ±1% on 1-3
 * random rows. Mirrors the Reflex field list verbatim.
 */
export const riskInputsSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  simulateNumericTick(rows, {
    fields: ["spot_price", "volatility", "interest_rate", "dividend_yield"],
    numRows: 3,
    jitter: [0.99, 1.01],
    decimals: 4,
  });
