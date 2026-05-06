"use client";

import { ChevronDown, Filter, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { FilterDateInput } from "@/components/grid/filter-bar";
import { cn } from "@/lib/utils";

const LABEL_CLASS =
  "text-[10px] font-semibold text-gray-500 uppercase tracking-wider";
const BTN_CLASS =
  "h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 shadow-sm cursor-pointer";

export type HistoricalDataFilterState = {
  tickers: string[];
  start: string;
  end: string;
};

export const createEmptyHistoricalDataFilters =
  (): HistoricalDataFilterState => ({
    tickers: [],
    start: "",
    end: "",
  });

export const hasHistoricalDataFilters = (
  filters: HistoricalDataFilterState,
) => Boolean(filters.tickers.length > 0 || filters.start || filters.end);

export const buildHistoricalDataQuery = (
  filters: HistoricalDataFilterState,
): { tickers?: string; start_date?: string; end_date?: string } | undefined => {
  const query: { tickers?: string; start_date?: string; end_date?: string } = {};

  if (filters.tickers.length > 0) query.tickers = filters.tickers.join(",");
  if (filters.start) query.start_date = filters.start;
  if (filters.end) query.end_date = filters.end;

  return Object.keys(query).length > 0 ? query : undefined;
};

export const getHistoricalTickerOptions = <TRow extends { ticker?: unknown }>(
  rows: TRow[],
) =>
  Array.from(
    new Set(
      rows
        .map((row) => (typeof row.ticker === "string" ? row.ticker.trim() : ""))
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

type HistoricalDataFilterBarProps = {
  value: HistoricalDataFilterState;
  availableTickers: string[];
  hasActiveFilters: boolean;
  onChange: (next: HistoricalDataFilterState) => void;
  onApply: () => void;
  onClear: () => void;
};

export function HistoricalDataFilterBar({
  value,
  availableTickers,
  hasActiveFilters,
  onChange,
  onApply,
  onClear,
}: HistoricalDataFilterBarProps) {
  const [tickerOpen, setTickerOpen] = useState(false);

  const tickerOptions = useMemo(
    () =>
      Array.from(new Set([...availableTickers, ...value.tickers])).sort((a, b) =>
        a.localeCompare(b),
      ),
    [availableTickers, value.tickers],
  );

  const toggleTicker = (ticker: string) => {
    const tickers = value.tickers.includes(ticker)
      ? value.tickers.filter((item) => item !== ticker)
      : [...value.tickers, ticker];
    onChange({ ...value, tickers });
  };

  const selectAllTickers = () => {
    onChange({ ...value, tickers: tickerOptions });
  };

  const clearTickers = () => {
    onChange({ ...value, tickers: [] });
  };

  const handleClear = () => {
    setTickerOpen(false);
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
          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={tickerOpen}
              aria-label="Ticker filter"
              onClick={() => setTickerOpen((open) => !open)}
              className="h-7 px-2.5 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer flex items-center"
            >
              <span className="flex items-center gap-1.5">
                <Filter size={12} className="text-gray-400" />
                <span className={LABEL_CLASS}>Tickers</span>
                {value.tickers.length > 0 ? (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded-full min-w-[16px] text-center">
                    {value.tickers.length}
                  </span>
                ) : null}
                <ChevronDown size={12} className="text-gray-400 ml-1" />
              </span>
            </button>
            {tickerOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Close ticker filter"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setTickerOpen(false)}
                />
                <div
                  role="listbox"
                  aria-label="Ticker options"
                  aria-multiselectable="true"
                  className="absolute top-full left-0 mt-1 min-w-[180px] max-w-[260px] bg-white rounded-md shadow-lg border border-gray-100 p-2 z-50"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                    <span className="text-[11px] font-bold text-gray-800">
                      Select Tickers
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={selectAllTickers}
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer px-1"
                      >
                        All
                      </button>
                      <span className="text-gray-300 mx-0.5">.</span>
                      <button
                        type="button"
                        onClick={clearTickers}
                        className="text-[10px] font-semibold text-gray-400 hover:text-red-500 cursor-pointer px-1"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto">
                    {tickerOptions.length > 0 ? (
                      tickerOptions.map((ticker) => {
                        const selected = value.tickers.includes(ticker);
                        return (
                          <button
                            key={ticker}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => toggleTicker(ticker)}
                            className={cn(
                              "px-2 py-1.5 text-[11px] font-medium rounded cursor-pointer border transition-all text-left",
                              selected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                            )}
                          >
                            {ticker}
                          </button>
                        );
                      })
                    ) : (
                      <span className="px-2 py-1 text-[11px] text-gray-400">
                        No tickers
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <FilterDateInput
            label="From"
            value={value.start}
            onChange={(start) => onChange({ ...value, start })}
          />
          <FilterDateInput
            label="To"
            value={value.end}
            onChange={(end) => onChange({ ...value, end })}
          />
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
