"use client";

import { Calendar, Search, Tag } from "lucide-react";
import type { ChangeEvent } from "react";

import { cn } from "@/lib/utils";

const LABEL_CLASS =
  "text-[10px] font-semibold text-gray-500 uppercase tracking-wider";
const INPUT_CLASS =
  "h-7 px-2 text-[11px] bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors";
const BTN_CLASS =
  "h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 shadow-sm cursor-pointer";

export type ResetDatesFilterState = {
  ticker: string;
  start_date: string;
  end_date: string;
  frequency: string;
  reset_month: string;
  reset_day: string;
  reset_up_down: string;
};

export const RESET_DATES_DEFAULT_FILTERS: ResetDatesFilterState = {
  ticker: "4592 JP_Series 1",
  start_date: "2026-03-03",
  end_date: "2029-03-08",
  frequency: "semiannually",
  reset_month: "3",
  reset_day: "3",
  reset_up_down: "up and down",
};

const TICKER_OPTIONS = [
  "4592 JP_Series 1",
  "9984 JP_Series 2",
  "6758 JP_Series 1",
  "7203 JP_Series 1",
];
const FREQUENCY_OPTIONS = ["semiannually", "annually", "quarterly", "monthly"];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1),
);
const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => String(index + 1));
const UP_DOWN_OPTIONS = ["up and down", "up", "down"];

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  widthClass: string;
  onChange: (next: string) => void;
};

function SelectField({
  label,
  value,
  options,
  widthClass,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="flex items-center gap-2">
      <span className={LABEL_CLASS}>{label}</span>
      <select
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onChange(event.target.value)
        }
        className={cn(INPUT_CLASS, widthClass)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

type ResetDatesFilterBarProps = {
  value: ResetDatesFilterState;
  onChange: (next: ResetDatesFilterState) => void;
  onApply: () => void;
};

export function ResetDatesFilterBar({
  value,
  onChange,
  onApply,
}: ResetDatesFilterBarProps) {
  const update = (next: Partial<ResetDatesFilterState>) => {
    onChange({ ...value, ...next });
  };

  return (
    <form
      className="w-full px-3 py-2 flex flex-col gap-2 bg-gradient-to-r from-gray-50/80 to-slate-50/80 border-b border-gray-100 backdrop-blur-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-gray-400" />
          <SelectField
            label="Select Ticker"
            value={value.ticker}
            options={TICKER_OPTIONS}
            widthClass="w-[180px]"
            onChange={(ticker) => update({ ticker })}
          />
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap w-full">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <label className="flex items-center gap-2">
            <span className={LABEL_CLASS}>Start/End Date</span>
            <input
              type="date"
              value={value.start_date}
              onChange={(event) => update({ start_date: event.target.value })}
              className={cn(INPUT_CLASS, "w-[140px]")}
            />
          </label>
          <span className="text-[10px] text-gray-400 font-medium">TO</span>
          <label className="sr-only" htmlFor="reset-dates-end-date">
            End Date
          </label>
          <input
            id="reset-dates-end-date"
            type="date"
            value={value.end_date}
            onChange={(event) => update({ end_date: event.target.value })}
            className={cn(INPUT_CLASS, "w-[140px]")}
          />
        </div>
        <SelectField
          label="Reset Freq"
          value={value.frequency}
          options={FREQUENCY_OPTIONS}
          widthClass="w-[130px]"
          onChange={(frequency) => update({ frequency })}
        />
        <SelectField
          label="Reset Month"
          value={value.reset_month}
          options={MONTH_OPTIONS}
          widthClass="w-[60px]"
          onChange={(reset_month) => update({ reset_month })}
        />
        <SelectField
          label="Reset On Day"
          value={value.reset_day}
          options={DAY_OPTIONS}
          widthClass="w-[60px]"
          onChange={(reset_day) => update({ reset_day })}
        />
        <SelectField
          label="Up/Down"
          value={value.reset_up_down}
          options={UP_DOWN_OPTIONS}
          widthClass="w-[120px]"
          onChange={(reset_up_down) => update({ reset_up_down })}
        />
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
      </div>
    </form>
  );
}
