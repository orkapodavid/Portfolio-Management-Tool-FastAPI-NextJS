"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { marketDataGetTickerData } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import {
  numberColumn,
  percentColumn,
  textColumn,
} from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type TickerRow = {
  id: number;
  ticker: string;
  currency: string;
  fx_rate: string;
  sector: string;
  company: string;
  po_lead_manager: string;
  fmat_cap: string;
  smkt_cap: string;
  chg_1d_pct: string;
  dtl: string;
};

const columns = [
  textColumn({
    field: "ticker",
    header: "Ticker",
    pinned: "left",
    minWidth: 100,
  }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  numberColumn({
    field: "fx_rate",
    header: "FX Rate",
    minWidth: 90,
    decimals: 4,
  }),
  textColumn({ field: "sector", header: "Sector", minWidth: 100 }),
  textColumn({ field: "company", header: "Company", minWidth: 150 }),
  textColumn({
    field: "po_lead_manager",
    header: "PO Lead Manager",
    minWidth: 130,
  }),
  textColumn({
    field: "fmat_cap",
    header: "FMat Cap",
    minWidth: 100,
    align: "right",
  }),
  textColumn({
    field: "smkt_cap",
    header: "SMkt Cap",
    minWidth: 100,
    align: "right",
  }),
  percentColumn({ field: "chg_1d_pct", header: "1D%", minWidth: 80 }),
  textColumn({ field: "dtl", header: "DTL", minWidth: 80 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function TickerDataPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TickerRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await marketDataGetTickerData({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load ticker data.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as TickerRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<TickerRow>
      gridId="ticker_data_grid"
      showCompactToggle
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      rowIdKey="ticker"
      emptyMessage="No reference data available."
      searchPlaceholder="Search tickers…"
    />
  );
}
