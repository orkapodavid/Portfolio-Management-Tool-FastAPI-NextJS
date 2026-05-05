import type { ColDef, ValueFormatterParams } from "ag-grid-community";

import { COLORS } from "@/lib/constants";

type BaseOptions = {
  field: string;
  header: string;
  width?: number;
  minWidth?: number;
  pinned?: "left" | "right";
  align?: "left" | "right" | "center";
  hide?: boolean;
};

const baseColDef = ({
  field,
  header,
  width,
  minWidth,
  pinned,
  hide,
}: BaseOptions): ColDef => ({
  field,
  headerName: header,
  width,
  minWidth: minWidth ?? 90,
  pinned,
  hide,
  sortable: true,
  resizable: true,
  filter: true,
});

const alignClass = (align?: BaseOptions["align"]) => {
  if (align === "right") return "ag-right-aligned-cell";
  if (align === "center") return "ag-center-aligned-cell";
  return undefined;
};

export function textColumn(options: BaseOptions): ColDef {
  return {
    ...baseColDef(options),
    filter: "agTextColumnFilter",
    cellClass: alignClass(options.align),
  };
}

export function numberColumn(
  options: BaseOptions & { decimals?: number }
): ColDef {
  const decimals = options.decimals ?? 2;
  return {
    ...baseColDef(options),
    filter: "agNumberColumnFilter",
    cellClass: alignClass(options.align ?? "right"),
    valueFormatter: (params: ValueFormatterParams) => {
      if (params.value === null || params.value === undefined || params.value === "") {
        return "";
      }
      const num = typeof params.value === "number" ? params.value : Number(params.value);
      if (Number.isNaN(num)) return String(params.value);
      return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
  };
}

export function currencyColumn(
  options: BaseOptions & { decimals?: number; currency?: string }
): ColDef {
  const decimals = options.decimals ?? 2;
  const symbol = options.currency ?? "$";
  return {
    ...baseColDef(options),
    filter: "agNumberColumnFilter",
    cellClass: alignClass(options.align ?? "right"),
    valueFormatter: (params: ValueFormatterParams) => {
      if (params.value === null || params.value === undefined || params.value === "") {
        return "";
      }
      // Pass through pre-formatted strings (e.g., the mock data returns "$50,000.00")
      if (typeof params.value === "string" && params.value.startsWith(symbol)) {
        return params.value;
      }
      const num = typeof params.value === "number" ? params.value : Number(params.value);
      if (Number.isNaN(num)) return String(params.value);
      return `${symbol}${num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    },
  };
}

export function percentColumn(
  options: BaseOptions & { decimals?: number; colorBySign?: boolean }
): ColDef {
  const decimals = options.decimals ?? 2;
  const colorBySign = options.colorBySign ?? true;
  return {
    ...baseColDef(options),
    filter: "agNumberColumnFilter",
    cellClass: alignClass(options.align ?? "right"),
    valueFormatter: (params: ValueFormatterParams) => {
      if (params.value === null || params.value === undefined || params.value === "") {
        return "";
      }
      // Pass through pre-formatted strings (mock data returns "+0.5%")
      if (typeof params.value === "string" && params.value.endsWith("%")) {
        return params.value;
      }
      const num = typeof params.value === "number" ? params.value : Number(params.value);
      if (Number.isNaN(num)) return String(params.value);
      const sign = num > 0 ? "+" : "";
      return `${sign}${num.toFixed(decimals)}%`;
    },
    cellStyle: colorBySign
      ? (params) => {
          const raw =
            typeof params.value === "number" ? params.value : parseFloat(String(params.value));
          if (Number.isNaN(raw)) return undefined;
          if (raw > 0) return { color: COLORS.POSITIVE_GREEN };
          if (raw < 0) return { color: COLORS.NEGATIVE_RED };
          return undefined;
        }
      : undefined,
  };
}

export function dateColumn(options: BaseOptions): ColDef {
  return {
    ...baseColDef(options),
    filter: "agDateColumnFilter",
    cellClass: alignClass(options.align ?? "left"),
  };
}

export function integerColumn(options: BaseOptions): ColDef {
  return numberColumn({ ...options, decimals: 0 });
}
