"use client";

import { ChevronDown, Globe2, Search, X } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

const LABEL_CLASS =
  "text-[10px] font-semibold text-gray-500 uppercase tracking-wider";
const RANGE_INPUT_CLASS =
  "h-7 w-[100px] px-2 text-[11px] bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const BTN_CLASS =
  "h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 shadow-sm cursor-pointer";

export type StockScreenerFilterState = {
  dtl10Min: string;
  dtl10Max: string;
  mktCapMin: string;
  mktCapMax: string;
  adv3mMin: string;
  adv3mMax: string;
  countries: string[];
};

export type StockScreenerFilterableRow = {
  dtl10?: unknown;
  mkt_cap_usd?: unknown;
  adv_3m_usd?: unknown;
  country?: unknown;
};

export const createEmptyStockScreenerFilters =
  (): StockScreenerFilterState => ({
    dtl10Min: "",
    dtl10Max: "",
    mktCapMin: "",
    mktCapMax: "",
    adv3mMin: "",
    adv3mMax: "",
    countries: [],
  });

export const hasStockScreenerFilters = (filters: StockScreenerFilterState) =>
  Boolean(
    filters.dtl10Min ||
      filters.dtl10Max ||
      filters.mktCapMin ||
      filters.mktCapMax ||
      filters.adv3mMin ||
      filters.adv3mMax ||
      filters.countries.length > 0,
  );

const parseNumeric = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const normalized = value.trim().replace(/,/g, "");
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const matchesRange = (
  value: unknown,
  minValue: string,
  maxValue: string,
): boolean => {
  if (!minValue && !maxValue) return true;

  const parsedValue = parseNumeric(value);
  const min = minValue ? parseNumeric(minValue) : null;
  const max = maxValue ? parseNumeric(maxValue) : null;

  if (parsedValue === null) return false;
  if (minValue && min === null) return false;
  if (maxValue && max === null) return false;
  if (min !== null && parsedValue < min) return false;
  if (max !== null && parsedValue > max) return false;

  return true;
};

export const getStockScreenerCountries = <
  TRow extends StockScreenerFilterableRow,
>(
  rows: TRow[],
) =>
  Array.from(
    new Set(
      rows
        .map((row) =>
          typeof row.country === "string" ? row.country.trim() : "",
        )
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

export const filterStockScreenerRows = <
  TRow extends StockScreenerFilterableRow,
>(
  rows: TRow[],
  filters: StockScreenerFilterState,
) => {
  if (!hasStockScreenerFilters(filters)) return rows;

  return rows.filter((row) => {
    if (!matchesRange(row.dtl10, filters.dtl10Min, filters.dtl10Max)) {
      return false;
    }
    if (!matchesRange(row.mkt_cap_usd, filters.mktCapMin, filters.mktCapMax)) {
      return false;
    }
    if (!matchesRange(row.adv_3m_usd, filters.adv3mMin, filters.adv3mMax)) {
      return false;
    }
    if (filters.countries.length > 0) {
      return (
        typeof row.country === "string" &&
        filters.countries.includes(row.country)
      );
    }

    return true;
  });
};

type RangeFilterProps = {
  label: string;
  minValue: string;
  maxValue: string;
  onMinChange: (next: string) => void;
  onMaxChange: (next: string) => void;
  onEnterApply: () => void;
  placeholderMin: string;
  placeholderMax: string;
};

function RangeFilter({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  onEnterApply,
  placeholderMin,
  placeholderMax,
}: RangeFilterProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onEnterApply();
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={LABEL_CLASS}>{label}</span>
      <input
        type="number"
        value={minValue}
        placeholder={placeholderMin}
        aria-label={`${label} min`}
        onChange={(event) => onMinChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className={RANGE_INPUT_CLASS}
      />
      <span className="text-gray-400 text-[11px]">-</span>
      <input
        type="number"
        value={maxValue}
        placeholder={placeholderMax}
        aria-label={`${label} max`}
        onChange={(event) => onMaxChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className={RANGE_INPUT_CLASS}
      />
    </div>
  );
}

type StockScreenerFilterBarProps = {
  value: StockScreenerFilterState;
  availableCountries: string[];
  hasActiveFilters: boolean;
  onChange: (next: StockScreenerFilterState) => void;
  onApply: () => void;
  onClear: () => void;
};

export function StockScreenerFilterBar({
  value,
  availableCountries,
  hasActiveFilters,
  onChange,
  onApply,
  onClear,
}: StockScreenerFilterBarProps) {
  const [countryOpen, setCountryOpen] = useState(false);

  const countryOptions = useMemo(
    () =>
      Array.from(new Set([...availableCountries, ...value.countries])).sort(
        (a, b) => a.localeCompare(b),
      ),
    [availableCountries, value.countries],
  );

  const updateField = (
    key: Exclude<keyof StockScreenerFilterState, "countries">,
    next: string,
  ) => {
    onChange({ ...value, [key]: next });
  };

  const toggleCountry = (country: string) => {
    const countries = value.countries.includes(country)
      ? value.countries.filter((item) => item !== country)
      : [...value.countries, country];
    onChange({ ...value, countries });
  };

  const handleClear = () => {
    setCountryOpen(false);
    onClear();
  };

  return (
    <form
      className="w-full px-3 py-2 bg-gradient-to-r from-gray-50/80 to-slate-50/80 border-b border-gray-100 backdrop-blur-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="flex items-center justify-between gap-2 w-full flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <RangeFilter
            label="DTL10"
            minValue={value.dtl10Min}
            maxValue={value.dtl10Max}
            onMinChange={(next) => updateField("dtl10Min", next)}
            onMaxChange={(next) => updateField("dtl10Max", next)}
            onEnterApply={onApply}
            placeholderMin="0"
            placeholderMax="30"
          />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <RangeFilter
            label="Mkt Cap (MM)"
            minValue={value.mktCapMin}
            maxValue={value.mktCapMax}
            onMinChange={(next) => updateField("mktCapMin", next)}
            onMaxChange={(next) => updateField("mktCapMax", next)}
            onEnterApply={onApply}
            placeholderMin="0"
            placeholderMax="5000000"
          />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <RangeFilter
            label="$ADV 3M"
            minValue={value.adv3mMin}
            maxValue={value.adv3mMax}
            onMinChange={(next) => updateField("adv3mMin", next)}
            onMaxChange={(next) => updateField("adv3mMax", next)}
            onEnterApply={onApply}
            placeholderMin="0"
            placeholderMax="100M"
          />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={countryOpen}
              aria-label="Country filter"
              onClick={() => setCountryOpen((open) => !open)}
              className="h-7 px-2.5 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer flex items-center"
            >
              <span className="flex items-center gap-1.5">
                <Globe2 size={12} className="text-gray-400" />
                <span className={LABEL_CLASS}>Country</span>
                {value.countries.length > 0 ? (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded-full min-w-[16px] text-center">
                    {value.countries.length}
                  </span>
                ) : null}
                <ChevronDown size={12} className="text-gray-400 ml-1" />
              </span>
            </button>
            {countryOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Close country filter"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setCountryOpen(false)}
                />
                <div
                  role="listbox"
                  aria-label="Country options"
                  aria-multiselectable="true"
                  className="absolute top-full left-0 mt-1 min-w-[220px] max-w-[320px] bg-white rounded-md shadow-lg border border-gray-100 p-2 z-50"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {countryOptions.length > 0 ? (
                      countryOptions.map((country) => {
                        const selected = value.countries.includes(country);
                        return (
                          <button
                            key={country}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => toggleCountry(country)}
                            className={cn(
                              "px-2.5 py-1 text-[11px] font-medium rounded-full cursor-pointer border transition-all",
                              selected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                            )}
                          >
                            {country}
                          </button>
                        );
                      })
                    ) : (
                      <span className="px-2 py-1 text-[11px] text-gray-400">
                        No countries
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className={cn(
              BTN_CLASS,
              "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md",
            )}
          >
            <Search size={12} />
            <span>Apply</span>
          </button>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                BTN_CLASS,
                "bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300",
              )}
            >
              <X size={12} />
              <span>Clear</span>
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
