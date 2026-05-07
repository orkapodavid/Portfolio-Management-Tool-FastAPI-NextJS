"use client";

import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const LABEL_CLASS =
  "text-[10px] font-semibold text-gray-500 uppercase tracking-wider";
const INPUT_CLASS =
  "h-7 px-2 text-[11px] bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors";
const BTN_CLASS =
  "h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 shadow-sm cursor-pointer";

type DateInputProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
};

export function FilterDateInput({ label, value, onChange }: DateInputProps) {
  return (
    <label className="flex items-center gap-1.5">
      <span className={LABEL_CLASS}>{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(INPUT_CLASS, "w-[130px]")}
      />
    </label>
  );
}

type FilterBarProps = {
  onApply: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  /** Inline children rendered before the Apply / Clear cluster. */
  children: ReactNode;
};

/**
 * Generic filter strip that renders a row of inputs followed by Apply / Clear.
 * Mirrors `filter_date_range_bar` from the Reflex side but stays generic so
 * pages can compose any combination of date / select / text inputs.
 */
export function FilterBar({
  onApply,
  onClear,
  hasActiveFilters,
  children,
}: FilterBarProps) {
  return (
    <div className="w-full px-3 py-2 bg-gradient-to-r from-gray-50/80 to-slate-50/80 border-b border-gray-100 backdrop-blur-sm">
      <div className="flex items-center gap-2 w-full flex-wrap">
        {children}
        <button
          type="button"
          onClick={onApply}
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
            onClick={onClear}
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
  );
}

type DateRangeFilterBarProps = {
  fromValue: string;
  toValue: string;
  onFromChange: (next: string) => void;
  onToChange: (next: string) => void;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  /** Optional content rendered before the From/To inputs (e.g. ticker filter). */
  extraLeadingContent?: ReactNode;
};

export function DateRangeFilterBar({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  onApply,
  onClear,
  hasActiveFilters,
  extraLeadingContent,
}: DateRangeFilterBarProps) {
  return (
    <FilterBar
      onApply={onApply}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
    >
      {extraLeadingContent ? (
        <>
          {extraLeadingContent}
          <div className="w-px h-5 bg-gray-200 mx-1" />
        </>
      ) : null}
      <FilterDateInput label="From" value={fromValue} onChange={onFromChange} />
      <FilterDateInput label="To" value={toValue} onChange={onToChange} />
    </FilterBar>
  );
}

type SingleDateFilterBarProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function SingleDateFilterBar({
  label,
  value,
  onChange,
  onApply,
  onClear,
  hasActiveFilters,
}: SingleDateFilterBarProps) {
  return (
    <FilterBar
      onApply={onApply}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
    >
      <FilterDateInput label={label} value={value} onChange={onChange} />
    </FilterBar>
  );
}
