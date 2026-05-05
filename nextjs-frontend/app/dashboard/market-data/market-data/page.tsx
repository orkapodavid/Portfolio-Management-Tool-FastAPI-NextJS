"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMarketData } from "@/app/clientService";
import { DataTable } from "@/components/layout/data-table";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "last_price", header: "Last Price", align: "right" as const },
  { key: "bid", header: "Bid", align: "right" as const },
  { key: "ask", header: "Ask", align: "right" as const },
  { key: "vwap_price", header: "VWAP", align: "right" as const },
  { key: "last_volume", header: "Volume", align: "right" as const },
  { key: "chg_1d_pct", header: "Chg 1D%", align: "right" as const },
  { key: "implied_vol_pct", header: "Impl Vol%", align: "right" as const },
  { key: "market_status", header: "Status", align: "center" as const },
];

type MarketDataRow = {
  id: number;
  ticker: string;
  last_price: string;
  bid: string;
  ask: string;
  vwap_price: string;
  last_volume: string;
  chg_1d_pct: string;
  implied_vol_pct: string;
  market_status: string;
};

const toStringValue = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const toNumberValue = (value: unknown) =>
  typeof value === "number" ? value : Number(value) || 0;

const getErrorStatus = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const { response } = error as { response?: { status?: number } };
  return response?.status;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return "Failed to load market data.";
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  if ("error" in error && typeof error.error === "object" && error.error) {
    const apiError = error.error as { detail?: unknown };
    if (typeof apiError.detail === "string") {
      return apiError.detail;
    }
  }

  return "Failed to load market data.";
};

const mapMarketDataRows = (payload: unknown): MarketDataRow[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((entry, index) => {
    const row = entry as Record<string, unknown>;

    return {
      id: toNumberValue(row.id ?? index),
      ticker: toStringValue(row.ticker),
      last_price: toStringValue(row.last_price),
      bid: toStringValue(row.bid),
      ask: toStringValue(row.ask),
      vwap_price: toStringValue(row.vwap_price),
      last_volume: toStringValue(row.last_volume),
      chg_1d_pct: toStringValue(row.chg_1d_pct),
      implied_vol_pct: toStringValue(row.implied_vol_pct),
      market_status: toStringValue(row.market_status),
    };
  });
};

export default function MarketDataPage() {
  const router = useRouter();
  const [marketData, setMarketData] = useState<MarketDataRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadMarketData = async () => {
      const token = getAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await getMarketData({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const error = getApiError(response);

      if (cancelled) {
        return;
      }

      if (error) {
        const status = getErrorStatus(error);

        if (status === 401 || status === 403) {
          router.replace("/login");
          return;
        }

        setErrorMessage(getErrorMessage(error));
        setIsLoading(false);
        return;
      }

      setMarketData(mapMarketDataRows(getApiData(response)));
      setErrorMessage(null);
      setIsLoading(false);
    };

    void loadMarketData();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center text-sm text-[#a6adc8]">
        Loading market data...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        {errorMessage}
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={marketData}
      emptyMessage="Market data is unavailable."
    />
  );
}
