"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { riskGetRiskMeasures } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type RiskMeasureRow = {
  id: number;
  ticker: string;
  seed: string | null;
  simulation_num: string | null;
  trial_num: string | null;
  underlying: string;
  sec_type: string;
  is_private: string;
  notional: string;
  notional_used: string | null;
  notional_current: string | null;
  currency: string;
  fx_rate: string;
  spot_price: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "seed", header: "Seed", minWidth: 80, align: "right" }),
  textColumn({ field: "simulation_num", header: "Simulation#", minWidth: 100, align: "right" }),
  textColumn({ field: "trial_num", header: "Trial#", minWidth: 80, align: "right" }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "is_private", header: "Is Private", minWidth: 90 }),
  textColumn({ field: "notional", header: "Notional", minWidth: 90, align: "right" }),
  textColumn({ field: "notional_used", header: "Notional Used", minWidth: 110, align: "right" }),
  textColumn({ field: "notional_current", header: "Notional Current", minWidth: 120, align: "right" }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  textColumn({ field: "fx_rate", header: "FX Rate", minWidth: 90, align: "right" }),
  textColumn({ field: "spot_price", header: "Spot Price", minWidth: 100, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function RiskMeasuresPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RiskMeasureRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await riskGetRiskMeasures({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load risk measures.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as RiskMeasureRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<RiskMeasureRow>
      gridId="risk_measures_grid"
      showCompactToggle
      showAutoRefresh
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      rowIdKey="ticker"
      emptyMessage="No risk measures available."
      searchPlaceholder="Search risk measures…"
    />
  );
}
