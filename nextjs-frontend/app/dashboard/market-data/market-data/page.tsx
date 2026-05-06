"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMarketData } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import {
  numberColumn,
  percentColumn,
  textColumn,
} from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type MarketDataRow = {
  id: number;
  ticker: string;
  listed_shares: string;
  last_volume: string;
  last_price: string;
  vwap_price: string;
  bid: string;
  ask: string;
  chg_1d_pct: string;
  implied_vol_pct: string;
  market_status: string;
  created_by: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  numberColumn({ field: "listed_shares", header: "Listed Shares (mm)", minWidth: 130 }),
  numberColumn({ field: "last_volume", header: "Last Volume", minWidth: 110 }),
  numberColumn({ field: "last_price", header: "Last Price", minWidth: 100 }),
  numberColumn({ field: "vwap_price", header: "vWAP Price", minWidth: 100 }),
  numberColumn({ field: "bid", header: "Bid", minWidth: 80 }),
  numberColumn({ field: "ask", header: "Ask", minWidth: 80 }),
  percentColumn({ field: "chg_1d_pct", header: "1D Change %", minWidth: 110 }),
  percentColumn({ field: "implied_vol_pct", header: "Implied Vol %", minWidth: 110, colorBySign: false }),
  textColumn({ field: "market_status", header: "Market Status", minWidth: 120 }),
  textColumn({ field: "created_by", header: "Created by", minWidth: 100 }),
];

const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }
  const { response } = error as { response?: { status?: number } };
  return response?.status;
};

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as { message?: unknown };
    if (typeof message === "string") return message;
  }
  return "Failed to load market data.";
};

export default function MarketDataPage() {
  const router = useRouter();
  const [rows, setRows] = useState<MarketDataRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const response = await getMarketData({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);

    if (error) {
      const status = getErrorStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage(extractMessage(error));
      setIsLoading(false);
      return;
    }

    setRows((getApiData(response) as MarketDataRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<MarketDataRow>
      gridId="market_data_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      rowIdKey="ticker"
      emptyMessage="Market data is unavailable."
      searchPlaceholder="Search market data…"
    />
  );
}
