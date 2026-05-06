"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Info } from "lucide-react";

import { riskPriceBond } from "@/app/clientService";
import { PayoffChart } from "@/components/risk/payoff-chart";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";
import { PRICER_NOTES } from "../pricer-notes";

type BondOutput = {
  fair_value: number;
  delta: number;
  expected_discount: number;
  bond_delta: number;
  bond_floor: number;
  bond_parity: number;
  currency: string;
  yield_curve: { x_values: number[]; y_values: number[]; x_label: string; y_label: string };
};

type BondFormState = {
  // Identifiers / dates (display only)
  model_instrument: string;
  underlying: string;
  valuation_date: string;
  effective_date: string;
  maturity_date: string;
  // Core pricing inputs
  spot_price: string;
  strike_price: string;
  min_exe_disc: string;
  currency: string;
  fx_rate: string;
  interest_rate: string;
  volatility: string;
  borrow_rate_bps: string;
  credit_spread_bps: string;
  time_to_maturity_years: string;
  // Reset
  reset_frequency: string;
  reset_month: string;
  reset_on_day: string;
  reset_lookback_days: string;
  reset_multiplier: string;
  reset_cap_price: string;
  reset_floor_price: string;
  reset_up_down: string;
  // Terms cont.
  notional: string;
  exec_redeemed: string;
  coupon_rate: string;
  coupon_freq: string;
  redemption_rate: string;
  redemption_freq: string;
  redemption_deferral: string;
  redemption_date_only: string;
  // Simulations
  seed: string;
  trial_num: string;
  simulation_num: string;
  jump_lambda: string;
  jump_mean: string;
  jump_std_dev: string;
  jump_to_zero: string;
  // Chart axes
  x_axis: "Maturity" | "Duration";
  y_axis: "Yield" | "Price";
};

const INITIAL: BondFormState = {
  model_instrument: "7777 JP CB",
  underlying: "",
  valuation_date: "",
  effective_date: "",
  maturity_date: "",
  spot_price: "506",
  strike_price: "506",
  min_exe_disc: "0.0",
  currency: "JPY",
  fx_rate: "155.88",
  interest_rate: "0.0073",
  volatility: "0.3",
  borrow_rate_bps: "1000",
  credit_spread_bps: "3000",
  time_to_maturity_years: "1.0",
  reset_frequency: "(none)",
  reset_month: "(none)",
  reset_on_day: "1",
  reset_lookback_days: "10",
  reset_multiplier: "0.9",
  reset_cap_price: "",
  reset_floor_price: "",
  reset_up_down: "up and down",
  notional: "100",
  exec_redeemed: "0",
  coupon_rate: "0.0",
  coupon_freq: "(none)",
  redemption_rate: "1.0",
  redemption_freq: "(none)",
  redemption_deferral: "(none)",
  redemption_date_only: "(none)",
  seed: "0",
  trial_num: "5",
  simulation_num: "100",
  jump_lambda: "0",
  jump_mean: "0.0",
  jump_std_dev: "0.2",
  jump_to_zero: "False",
  x_axis: "Maturity",
  y_axis: "Yield",
};

const LABEL_CLS = "text-[9px] font-bold text-gray-500 uppercase tracking-[0.08em] mb-0.5 block";
const INPUT_CLS =
  "h-7 w-full px-2 text-[11px] font-medium text-gray-800 bg-white border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";
const SECTION_HEADER_CLS =
  "text-[10px] font-black text-gray-600 uppercase tracking-[0.15em] mb-3 pb-2 border-b-2 border-gray-300";

type NumericTone = "negative";

type BondPricingRow = {
  ticker: string;
  spotPrice: string;
  fairValue: string;
  discount: string;
  discountTone?: NumericTone;
  currency: string;
  tradeDate: string;
  strikePrice: string;
  parity: string;
  delta: string;
  bondFloor: string;
};

const BOND_PRICING_RESULTS: BondPricingRow[] = [
  {
    ticker: "7777 JP CB",
    spotPrice: "¥506.000",
    fairValue: "¥101.020",
    discount: "0.00%",
    currency: "JPY",
    tradeDate: "2026-02-11",
    strikePrice: "¥506.000",
    parity: "¥100.000",
    delta: "0.14",
    bondFloor: "¥97.508",
  },
  {
    ticker: "7777 JP CB",
    spotPrice: "¥504.710",
    fairValue: "¥101.020",
    discount: "(0.24%)",
    discountTone: "negative",
    currency: "JPY",
    tradeDate: "2026-01-25",
    strikePrice: "¥506.000",
    parity: "¥99.745",
    delta: "0.14",
    bondFloor: "¥97.508",
  },
  {
    ticker: "7777 JP CB",
    spotPrice: "¥504.211",
    fairValue: "¥100.121",
    discount: "(0.12%)",
    discountTone: "negative",
    currency: "JPY",
    tradeDate: "2026-02-05",
    strikePrice: "¥506.000",
    parity: "¥99.646",
    delta: "0.14",
    bondFloor: "¥97.500",
  },
  {
    ticker: "7777 JP CB",
    spotPrice: "¥503.500",
    fairValue: "¥100.050",
    discount: "0.05%",
    currency: "JPY",
    tradeDate: "2026-02-10",
    strikePrice: "¥506.000",
    parity: "¥99.505",
    delta: "0.13",
    bondFloor: "¥97.250",
  },
  {
    ticker: "7777 JP CB",
    spotPrice: "¥507.100",
    fairValue: "¥101.420",
    discount: "0.42%",
    currency: "JPY",
    tradeDate: "2026-02-11",
    strikePrice: "¥506.000",
    parity: "¥100.217",
    delta: "0.14",
    bondFloor: "¥97.650",
  },
  {
    ticker: "7777 JP CB",
    spotPrice: "¥500.000",
    fairValue: "¥99.800",
    discount: "(0.20%)",
    discountTone: "negative",
    currency: "JPY",
    tradeDate: "2026-01-15",
    strikePrice: "¥506.000",
    parity: "¥98.814",
    delta: "0.12",
    bondFloor: "¥97.000",
  },
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

const toFloat = (s: string, fallback = 0): number => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
};
const toInt = (s: string, fallback = 0): number => {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : fallback;
};

type FieldDef<K extends keyof BondFormState> = {
  name: K;
  label: string;
  type?: "text" | "date";
};
type SelectDef<K extends keyof BondFormState> = {
  name: K;
  label: string;
  options: readonly string[];
};

export default function PricerBondPage() {
  const router = useRouter();
  const [form, setForm] = useState<BondFormState>(INITIAL);
  const [output, setOutput] = useState<BondOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const set = <K extends keyof BondFormState>(name: K, value: BondFormState[K]) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const F = <K extends keyof BondFormState>({ name, label, type = "text" }: FieldDef<K>) => (
    <div className="flex flex-col">
      <label className={LABEL_CLS}>{label}</label>
      <input
        type={type}
        value={form[name] as string}
        onChange={(e) => set(name, e.target.value as BondFormState[K])}
        className={INPUT_CLS}
      />
    </div>
  );

  const S = <K extends keyof BondFormState>({ name, label, options }: SelectDef<K>) => (
    <div className="flex flex-col">
      <label className={LABEL_CLS}>{label}</label>
      <select
        value={form[name] as string}
        onChange={(e) => set(name, e.target.value as BondFormState[K])}
        className={INPUT_CLS}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );

  const onCalculate = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await riskPriceBond({
      headers: { Authorization: `Bearer ${token}` },
      body: {
        spot_price: toFloat(form.spot_price),
        strike_price: toFloat(form.strike_price),
        notional: toFloat(form.notional, 100),
        coupon_rate: toFloat(form.coupon_rate, 0),
        redemption_rate: toFloat(form.redemption_rate, 1),
        volatility: toFloat(form.volatility, 0.3),
        interest_rate: toFloat(form.interest_rate, 0.005),
        borrow_rate_bps: toInt(form.borrow_rate_bps, 0),
        credit_spread_bps: toInt(form.credit_spread_bps, 0),
        time_to_maturity_years: toFloat(form.time_to_maturity_years, 1),
        min_exe_disc: toFloat(form.min_exe_disc, 0),
        exec_redeemed: toInt(form.exec_redeemed, 0),
        seed: toInt(form.seed, 0),
        trial_num: toInt(form.trial_num, 5),
        simulation_num: toInt(form.simulation_num, 100),
        jump_lambda: toFloat(form.jump_lambda, 0),
        jump_mean: toFloat(form.jump_mean, 0),
        jump_std_dev: toFloat(form.jump_std_dev, 0.2),
        currency: form.currency || "JPY",
        x_axis: form.x_axis,
        y_axis: form.y_axis,
      },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Pricer call failed.");
      setIsLoading(false);
      return;
    }
    setOutput(getApiData(response) as BondOutput);
    setIsLoading(false);
  }, [form, router]);

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-y-auto">
      <div className="flex w-full bg-white border-b border-gray-200">
        <div className="flex-[3] p-4 bg-white overflow-y-auto">
          <h3 className={SECTION_HEADER_CLS}>Terms</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <S
              name="model_instrument"
              label="Model Instrument"
              options={["7777 JP CB", "7203 JP CB", "9984 JP CB"]}
            />
            <F name="underlying" label="Underlying" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <F name="valuation_date" label="Valuation Date" type="date" />
            <F name="effective_date" label="Effective Date" type="date" />
            <F name="maturity_date" label="Maturity Date" type="date" />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            <F name="spot_price" label="Spot Price (Opt)" />
            <F name="strike_price" label="Strike Price" />
            <F name="min_exe_disc" label="Min Exe Disc %" />
            <F name="currency" label="Currency" />
            <F name="fx_rate" label="FX Rate (Opt)" />
            <F name="interest_rate" label="Interest Rate (Opt)" />
            <F name="volatility" label="Volatility" />
            <F name="borrow_rate_bps" label="Borrow Rate (bps)" />
            <F name="credit_spread_bps" label="Credit Spread (bps)" />
            <F name="time_to_maturity_years" label="Time to Maturity (yrs)" />
          </div>
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
            <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-[0.1em] mb-2">
              Reset Parameters
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <S
                name="reset_frequency"
                label="Reset Frequency"
                options={["(none)", "daily", "weekly", "biweekly", "monthly", "quarterly"]}
              />
              <S
                name="reset_month"
                label="Reset Month"
                options={["(none)", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]}
              />
              <S
                name="reset_on_day"
                label="Reset on Day"
                options={["1", "2", "3", "4", "5", "10", "15", "20", "25"]}
              />
              <F name="reset_lookback_days" label="Reset Lookback Days" />
              <F name="reset_multiplier" label="Reset Multiplier" />
              <F name="reset_cap_price" label="Reset Cap Price" />
              <F name="reset_floor_price" label="Reset Floor Price (Opt)" />
              <S
                name="reset_up_down"
                label="Reset Up/Down"
                options={["up and down", "up only", "down only"]}
              />
            </div>
          </div>
        </div>
        <div className="flex-[3] flex flex-col border-l border-gray-200">
          <div className="p-4 bg-white">
            <h3 className={SECTION_HEADER_CLS}>Terms Cont.</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <F name="notional" label="Notional" />
              <F name="exec_redeemed" label="Exec/Redeemed" />
              <F name="coupon_rate" label="Coupon Rate" />
              <S
                name="coupon_freq"
                label="Coupon Freq"
                options={["(none)", "semi-annual", "annual", "quarterly"]}
              />
              <F name="redemption_rate" label="Redemption Rate" />
              <S
                name="redemption_freq"
                label="Redemption Freq"
                options={["(none)", "annual", "semi-annual", "quarterly"]}
              />
              <S
                name="redemption_deferral"
                label="Redemption Deferral"
                options={["(none)", "30 days", "60 days", "90 days"]}
              />
              <S
                name="redemption_date_only"
                label="Redemption Date Only"
                options={["(none)", "True", "False"]}
              />
            </div>
          </div>
          <div className="p-4 bg-white border-t border-gray-200">
            <h3 className={SECTION_HEADER_CLS}>Simulations</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <F name="seed" label="Seed" />
              <F name="trial_num" label="Trial #" />
              <F name="simulation_num" label="Simulation #" />
              <F name="jump_lambda" label="Jump Lambda" />
              <F name="jump_mean" label="Jump Mean" />
              <F name="jump_std_dev" label="Jump Std Dev" />
              <S name="jump_to_zero" label="Jump to 0" options={["False", "True"]} />
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <h3 className={SECTION_HEADER_CLS}>Outputs</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Out label="Fair Value" value={output?.fair_value?.toFixed(3) ?? "—"} accent />
              <Out label="Delta" value={output?.delta?.toFixed(3) ?? "—"} />
              <Out
                label="Exp. Discount"
                value={output ? `${output.expected_discount.toFixed(2)}%` : "—"}
              />
              <Out label="Bond Delta" value={output?.bond_delta?.toFixed(3) ?? "—"} />
              <Out label="Bond Floor" value={output?.bond_floor?.toFixed(3) ?? "—"} />
              <Out label="Bond Parity" value={output?.bond_parity?.toFixed(3) ?? "—"} />
            </div>
            <button
              onClick={onCalculate}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full h-9 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Calculator size={14} />
              <span className="text-xs font-bold">{isLoading ? "Calculating…" : "Calculate"}</span>
            </button>
            {errorMessage && (
              <div className="mt-3 px-3 py-2 text-[10px] text-red-700 bg-red-50 border border-red-200 rounded">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
        <div className="flex-[4] flex flex-col border-l border-gray-200">
          <BondPricingResultsTable />
        </div>
      </div>
      <div className="p-3">
        <div className="px-4 py-3 bg-amber-50/50 border border-amber-200/60 rounded-lg">
          <h4 className="flex items-center text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] mb-2">
            <Info size={12} className="text-amber-500" />
            <span className="ml-1">Notes</span>
          </h4>
          {PRICER_NOTES.map((n) => (
            <p key={n} className="text-[9px] text-gray-500 leading-relaxed mb-1">
              • {n}
            </p>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-6 p-3 bg-gray-50 border-y border-gray-200">
        <S name="x_axis" label="X-Axis" options={["Maturity", "Duration"]} />
        <S name="y_axis" label="Y-Axis" options={["Yield", "Price"]} />
      </div>
      <div className="w-full p-4 min-h-[320px]">
        <PayoffChart
          xValues={output?.yield_curve?.x_values ?? []}
          yValues={output?.yield_curve?.y_values ?? []}
          xLabel={output?.yield_curve?.x_label ?? form.x_axis}
          yLabel={output?.yield_curve?.y_label ?? form.y_axis}
        />
      </div>
    </div>
  );
}

function BondPricingResultsTable() {
  return (
    <div className="p-4 bg-white flex-1">
      <h3 className={SECTION_HEADER_CLS}>Pricing Results</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-separate border-spacing-0">
          <thead>
            <tr>
              <HeaderCell label="Ticker" />
              <HeaderCell label="Spot Price" align="right" />
              <HeaderCell label="Fair Value" align="right" />
              <HeaderCell label="Discount" align="right" />
              <HeaderCell label="Currency" />
              <HeaderCell label="Trade Date" />
              <HeaderCell label="Strike Price" align="right" />
              <HeaderCell label="Parity" align="right" />
              <HeaderCell label="Delta" align="right" />
              <HeaderCell label="Bond Floor" align="right" />
            </tr>
          </thead>
          <tbody>
            {BOND_PRICING_RESULTS.map((row) => (
              <tr
                key={`${row.tradeDate}-${row.spotPrice}-${row.fairValue}`}
                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <TextCell value={row.ticker} />
                <NumberCell value={row.spotPrice} />
                <NumberCell value={row.fairValue} />
                <NumberCell value={row.discount} tone={row.discountTone} />
                <TextCell value={row.currency} />
                <TextCell value={row.tradeDate} />
                <NumberCell value={row.strikePrice} />
                <NumberCell value={row.parity} />
                <NumberCell value={row.delta} />
                <NumberCell value={row.bondFloor} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeaderCell({ label, align = "left" }: { label: string; align?: "left" | "right" }) {
  return (
    <th
      className={`px-3 py-3 text-[10px] font-bold text-gray-700 uppercase tracking-widest border-b-2 border-gray-400 bg-[#E5E7EB] sticky top-0 z-30 shadow-sm h-[44px] whitespace-nowrap ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {label}
    </th>
  );
}

function TextCell({ value }: { value: string }) {
  return (
    <td className="px-3 py-2 text-[10px] font-medium text-gray-700 border-b border-gray-200 align-middle whitespace-nowrap">
      {value}
    </td>
  );
}

function NumberCell({ value, tone }: { value: string; tone?: NumericTone }) {
  return (
    <td
      className={`px-3 py-2 text-[10px] font-mono border-b border-gray-200 text-right ${
        tone === "negative" ? "font-bold text-[#DD0000]" : "font-medium text-gray-700"
      }`}
    >
      {value}
    </td>
  );
}

function Out({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] block mb-0.5">
        {label}
      </span>
      <span
        className={
          accent
            ? "text-base font-black font-mono text-[#00AA00]"
            : "text-base font-bold font-mono text-gray-700"
        }
      >
        {value}
      </span>
    </div>
  );
}
