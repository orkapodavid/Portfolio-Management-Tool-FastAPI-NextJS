"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Info } from "lucide-react";

import { riskPriceWarrant } from "@/app/clientService";
import { PayoffChart } from "@/components/risk/payoff-chart";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";
import { PRICER_NOTES } from "../pricer-notes";

type WarrantOutput = {
  fair_value: number;
  delta: number;
  expected_discount: number;
  currency: string;
  payoff_curve: { x_values: number[]; y_values: number[]; y_type: string };
};

type WarrantFormState = {
  // Term — dates + identifiers (display only — not used in pricing)
  valuation_date: string;
  effective_date: string;
  maturity_date: string;
  underlying: string;
  model_ticker: string;
  // Term — numeric (sent to backend)
  spot_price: string;
  strike_price: string;
  min_exe_disc: string;
  currency: string;
  fx_rate: string;
  interest_rate: string;
  volatility: string;
  borrow_rate_bps: string;
  time_to_maturity_years: string;
  // Term — reset fields
  reset_frequency: string;
  reset_month: string;
  reset_on_day: string;
  reset_lookback_days: string;
  reset_multiplier: string;
  reset_cap_price: string;
  reset_floor_price: string;
  reset_up_down: string;
  // Simulations
  seed: string;
  trial_num: string;
  simulation_num: string;
  jump_lambda: string;
  jump_mean: string;
  jump_std_dev: string;
  jump_to_zero: string;
  // Chart axis
  y_axis: "Value" | "Delta" | "Gamma";
};

const INITIAL: WarrantFormState = {
  valuation_date: "",
  effective_date: "",
  maturity_date: "",
  underlying: "",
  model_ticker: "7777 JP Warrant",
  spot_price: "498",
  strike_price: "498",
  min_exe_disc: "0.0",
  currency: "JPY",
  fx_rate: "155.88",
  interest_rate: "0.0073",
  volatility: "0.3",
  borrow_rate_bps: "1000",
  time_to_maturity_years: "1.0",
  reset_frequency: "(none)",
  reset_month: "(none)",
  reset_on_day: "1",
  reset_lookback_days: "10",
  reset_multiplier: "0.9",
  reset_cap_price: "",
  reset_floor_price: "",
  reset_up_down: "up and down",
  seed: "0",
  trial_num: "5",
  simulation_num: "100",
  jump_lambda: "0",
  jump_mean: "0.0",
  jump_std_dev: "0.2",
  jump_to_zero: "False",
  y_axis: "Value",
};

const LABEL_CLS =
  "text-[9px] font-bold text-gray-500 uppercase tracking-[0.08em] mb-0.5 block";
const INPUT_CLS =
  "h-7 w-full px-2 text-[11px] font-medium text-gray-800 bg-white border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";
const SECTION_HEADER_CLS =
  "text-[10px] font-black text-gray-600 uppercase tracking-[0.15em] mb-3 pb-2 border-b-2 border-gray-300";

type NumericTone = "positive" | "negative";

type WarrantPricingRow = {
  ticker: string;
  spotPrice: string;
  fairValue: string;
  discount: string;
  discountTone: NumericTone;
};

const WARRANT_PRICING_RESULTS: WarrantPricingRow[] = [
  {
    ticker: "7777 JP Warrant",
    spotPrice: "498.00",
    fairValue: "15.50",
    discount: "+3.11%",
    discountTone: "positive",
  },
  {
    ticker: "7203 JP Warrant",
    spotPrice: "2,845.00",
    fairValue: "142.25",
    discount: "+5.00%",
    discountTone: "positive",
  },
  {
    ticker: "9984 JP Warrant",
    spotPrice: "8,520.00",
    fairValue: "380.10",
    discount: "-1.25%",
    discountTone: "negative",
  },
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
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

type Field<K extends keyof WarrantFormState> = {
  name: K;
  label: string;
  type?: "text" | "date" | "number";
};

type SelectField<K extends keyof WarrantFormState> = {
  name: K;
  label: string;
  options: readonly string[];
};

export default function PricerWarrantPage() {
  const router = useRouter();
  const [form, setForm] = useState<WarrantFormState>(INITIAL);
  const [output, setOutput] = useState<WarrantOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const set = <K extends keyof WarrantFormState>(
    name: K,
    value: WarrantFormState[K],
  ) => setForm((prev) => ({ ...prev, [name]: value }));

  const renderField = <K extends keyof WarrantFormState>({
    name,
    label,
    type = "text",
  }: Field<K>) => (
    <div className="flex flex-col" key={String(name)}>
      <label className={LABEL_CLS}>{label}</label>
      <input
        type={type}
        value={form[name] as string}
        onChange={(e) => set(name, e.target.value as WarrantFormState[K])}
        className={INPUT_CLS}
      />
    </div>
  );

  const renderSelect = <K extends keyof WarrantFormState>({
    name,
    label,
    options,
  }: SelectField<K>) => (
    <div className="flex flex-col" key={String(name)}>
      <label className={LABEL_CLS}>{label}</label>
      <select
        value={form[name] as string}
        onChange={(e) => set(name, e.target.value as WarrantFormState[K])}
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
    const response = await riskPriceWarrant({
      headers: { Authorization: `Bearer ${token}` },
      body: {
        spot_price: toFloat(form.spot_price),
        strike_price: toFloat(form.strike_price),
        volatility: toFloat(form.volatility, 0.3),
        interest_rate: toFloat(form.interest_rate, 0.005),
        borrow_rate_bps: toInt(form.borrow_rate_bps, 0),
        time_to_maturity_years: toFloat(form.time_to_maturity_years, 1.0),
        min_exe_disc: toFloat(form.min_exe_disc, 0.0),
        reset_lookback_days: toInt(form.reset_lookback_days, 10),
        reset_multiplier: toFloat(form.reset_multiplier, 0.9),
        seed: toInt(form.seed, 0),
        trial_num: toInt(form.trial_num, 5),
        simulation_num: toInt(form.simulation_num, 100),
        jump_lambda: toFloat(form.jump_lambda, 0),
        jump_mean: toFloat(form.jump_mean, 0),
        jump_std_dev: toFloat(form.jump_std_dev, 0.2),
        currency: form.currency || "JPY",
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
    setOutput(getApiData(response) as WarrantOutput);
    setIsLoading(false);
  }, [form, router]);

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-y-auto">
      <div className="flex w-full bg-white border-b border-gray-200">
        <div className="flex-[3] p-4 bg-white">
          <h3 className={SECTION_HEADER_CLS}>Terms</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {renderField({
              name: "valuation_date",
              label: "Valuation Date",
              type: "date",
            })}
            {renderField({
              name: "effective_date",
              label: "Effective Date",
              type: "date",
            })}
            {renderField({
              name: "maturity_date",
              label: "Maturity Date",
              type: "date",
            })}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            {renderField({ name: "underlying", label: "Underlying" })}
            {renderSelect({
              name: "model_ticker",
              label: "Model Ticker",
              options: [
                "7777 JP Warrant",
                "7203 JP Warrant",
                "9984 JP Warrant",
              ],
            })}
            {renderField({ name: "spot_price", label: "Spot Price (Opt)" })}
            {renderField({ name: "strike_price", label: "Strike Price" })}
            {renderField({ name: "min_exe_disc", label: "Min Exe Disc" })}
            {renderField({ name: "currency", label: "Currency" })}
            {renderField({ name: "fx_rate", label: "FX Rate (Opt)" })}
            {renderField({
              name: "interest_rate",
              label: "Interest Rate (Opt)",
            })}
            {renderField({ name: "volatility", label: "Volatility" })}
            {renderField({
              name: "borrow_rate_bps",
              label: "Borrow Rate (bps)",
            })}
            {renderField({
              name: "time_to_maturity_years",
              label: "Time to Maturity (yrs)",
            })}
          </div>
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
            <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-[0.1em] mb-2">
              Reset Parameters
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {renderSelect({
                name: "reset_frequency",
                label: "Reset Frequency",
                options: [
                  "(none)",
                  "daily",
                  "weekly",
                  "biweekly",
                  "monthly",
                  "quarterly",
                ],
              })}
              {renderSelect({
                name: "reset_month",
                label: "Reset Month",
                options: [
                  "(none)",
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12",
                ],
              })}
              {renderSelect({
                name: "reset_on_day",
                label: "Reset on Day",
                options: ["1", "2", "3", "4", "5", "10", "15", "20", "25"],
              })}
              {renderField({
                name: "reset_lookback_days",
                label: "Reset Lookback Days",
              })}
              {renderField({
                name: "reset_multiplier",
                label: "Reset Multiplier",
              })}
              {renderField({
                name: "reset_cap_price",
                label: "Reset Cap Price",
              })}
              {renderField({
                name: "reset_floor_price",
                label: "Reset Floor Price",
              })}
              {renderSelect({
                name: "reset_up_down",
                label: "Reset Up/Down",
                options: ["up and down", "up only", "down only"],
              })}
            </div>
          </div>
        </div>
        <div className="flex-[2] flex flex-col border-l border-gray-200">
          <div className="p-4 bg-white">
            <h3 className={SECTION_HEADER_CLS}>Simulations</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {renderField({ name: "seed", label: "Seed" })}
              {renderField({ name: "trial_num", label: "Trial #" })}
              {renderField({ name: "simulation_num", label: "Simulation #" })}
              {renderField({ name: "jump_lambda", label: "Jump Lambda" })}
              {renderField({ name: "jump_mean", label: "Jump Mean" })}
              {renderField({ name: "jump_std_dev", label: "Jump Std Dev" })}
              {renderSelect({
                name: "jump_to_zero",
                label: "Jump to 0",
                options: ["False", "True"],
              })}
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <h3 className={SECTION_HEADER_CLS}>Outputs</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <OutputMetric
                label="Fair Value"
                value={output?.fair_value?.toFixed(2) ?? "—"}
                accent
              />
              <OutputMetric
                label="Delta"
                value={output?.delta?.toFixed(2) ?? "—"}
              />
              <OutputMetric
                label="Expected Discount"
                value={output ? `${output.expected_discount.toFixed(2)}%` : "—"}
              />
            </div>
            <button
              onClick={onCalculate}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full h-9 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Calculator size={14} />
              <span className="text-xs font-bold">
                {isLoading ? "Calculating…" : "Calculate"}
              </span>
            </button>
            {errorMessage && (
              <div className="mt-3 px-3 py-2 text-[10px] text-red-700 bg-red-50 border border-red-200 rounded">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
        <div className="flex-[2] flex flex-col border-l border-gray-200">
          <PricingResultsTable />
        </div>
      </div>
      <div className="p-3">
        <div className="px-4 py-3 bg-amber-50/50 border border-amber-200/60 rounded-lg">
          <h4 className="flex items-center text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] mb-2">
            <Info size={12} className="text-amber-500" />
            <span className="ml-1">Notes</span>
          </h4>
          {PRICER_NOTES.map((n) => (
            <p
              key={n}
              className="text-[9px] text-gray-500 leading-relaxed mb-1"
            >
              • {n}
            </p>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-6 p-3 bg-gray-50 border-y border-gray-200">
        {renderSelect({
          name: "y_axis",
          label: "Y-Axis",
          options: ["Value", "Delta", "Gamma"],
        })}
      </div>
      <div className="w-full p-4 min-h-[320px]">
        <PayoffChart
          xValues={output?.payoff_curve?.x_values ?? []}
          yValues={output?.payoff_curve?.y_values ?? []}
          xLabel="Spot Price"
          yLabel={form.y_axis}
        />
      </div>
    </div>
  );
}

function PricingResultsTable() {
  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <h3 className={SECTION_HEADER_CLS}>Pricing Results</h3>
      <table className="w-full table-auto border-separate border-spacing-0">
        <thead>
          <tr>
            <HeaderCell label="Ticker" />
            <HeaderCell label="Spot Price" align="right" />
            <HeaderCell label="Fair Value" align="right" />
            <HeaderCell label="Discount" align="right" />
          </tr>
        </thead>
        <tbody>
          {WARRANT_PRICING_RESULTS.map((row) => (
            <tr
              key={row.ticker}
              className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <TextCell value={row.ticker} />
              <NumberCell value={row.spotPrice} />
              <NumberCell value={row.fairValue} />
              <NumberCell value={row.discount} tone={row.discountTone} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell({
  label,
  align = "left",
}: {
  label: string;
  align?: "left" | "right";
}) {
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
  const toneClass =
    tone === "positive"
      ? "font-bold text-[#00AA00]"
      : tone === "negative"
        ? "font-bold text-[#DD0000]"
        : "font-medium text-gray-700";

  return (
    <td
      className={`px-3 py-2 text-[10px] font-mono border-b border-gray-200 text-right ${toneClass}`}
    >
      {value}
    </td>
  );
}

function OutputMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
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
