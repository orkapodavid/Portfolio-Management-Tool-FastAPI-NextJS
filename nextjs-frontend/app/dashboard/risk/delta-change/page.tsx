"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { riskGetDeltaChange } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type DeltaChangeRow = {
  id: number;
  ticker: string;
  company_name: string;
  sec_type: string;
  currency: string;
  fx_rate: string;
  spot_price: string;
  valuation_price: string;
  pos_delta: string | null;
  pos_gamma: string | null;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_type", header: "Structure", minWidth: 100 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  textColumn({ field: "fx_rate", header: "FX Rate", minWidth: 90, align: "right" }),
  textColumn({ field: "spot_price", header: "Current Price", minWidth: 110, align: "right" }),
  textColumn({ field: "valuation_price", header: "Valuation Price", minWidth: 120, align: "right" }),
  textColumn({ field: "pos_delta", header: "POS DELTA", minWidth: 100, align: "right" }),
  textColumn({ field: "pos_gamma", header: "Pos Gamma", minWidth: 100, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function DeltaChangePage() {
  const router = useRouter();
  const [rows, setRows] = useState<DeltaChangeRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await riskGetDeltaChange({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load delta change.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as DeltaChangeRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<DeltaChangeRow>
      gridId="delta_change_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      rowIdKey="ticker"
      emptyMessage="No delta change data available."
      searchPlaceholder="Search delta change…"
    />
  );
}
