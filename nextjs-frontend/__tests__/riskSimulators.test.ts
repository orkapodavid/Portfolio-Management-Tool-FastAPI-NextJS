import {
  deltaChangeSimulator,
  riskInputsSimulator,
  riskMeasuresSimulator,
} from "@/lib/grid-simulators/risk";

const buildDeltaChangeRows = () =>
  Array.from({ length: 6 }, (_, i) => ({
    id: i,
    ticker: `T${i}`,
    delta: "0.5000",
    gamma: "0.0250",
    vega: "0.1500",
    theta: "-0.0100",
  }));

const buildRiskMeasuresRows = () =>
  Array.from({ length: 6 }, (_, i) => ({
    id: i,
    ticker: `T${i}`,
    spot_price: "100.0000",
    fx_rate: "1.2500",
    delta: "0.5000",
    gamma: "0.0250",
    vega: "0.1500",
    theta: "-0.0100",
  }));

const buildRiskInputsRows = () =>
  Array.from({ length: 6 }, (_, i) => ({
    id: i,
    ticker: `T${i}`,
    spot_price: "100.0000",
    volatility: "0.2500",
    interest_rate: "0.0500",
    dividend_yield: "0.0150",
  }));

describe("risk simulators", () => {
  it("deltaChangeSimulator returns a fresh array and mutates at least one row", () => {
    const rows = buildDeltaChangeRows();
    const next = deltaChangeSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
  });

  it("riskMeasuresSimulator returns a fresh array and mutates at least one row", () => {
    const rows = buildRiskMeasuresRows();
    const next = riskMeasuresSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
  });

  it("riskInputsSimulator returns a fresh array and mutates at least one row", () => {
    const rows = buildRiskInputsRows();
    const next = riskInputsSimulator(rows);
    expect(next).not.toBe(rows);
    const changed = next.filter((row, i) => row !== rows[i]);
    expect(changed.length).toBeGreaterThan(0);
  });
});
