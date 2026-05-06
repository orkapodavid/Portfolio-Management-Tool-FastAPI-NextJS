"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { reconciliationGetRiskInputRecon } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type RiskInputReconRow = {
  id: number;
  ticker: string;
  value_date: string;
  underlying: string;
  sec_type: string;
  spot_mc: string;
  spot_ppd: string;
  position: string;
  value_mc: string;
  value_ppd: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  dateColumn({ field: "value_date", header: "Value Date", minWidth: 100 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "spot_mc", header: "Spot (MC)", minWidth: 90, align: "right" }),
  textColumn({ field: "spot_ppd", header: "Spot (PPD)", minWidth: 90, align: "right" }),
  textColumn({ field: "position", header: "Position", minWidth: 90, align: "right" }),
  textColumn({ field: "value_mc", header: "Value (MC)", minWidth: 90, align: "right" }),
  textColumn({ field: "value_ppd", header: "Value (PPD)", minWidth: 90, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function RiskInputReconPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RiskInputReconRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await reconciliationGetRiskInputRecon({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load risk input reconciliation.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as RiskInputReconRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<RiskInputReconRow>
      gridId="risk_input_recon_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No risk input reconciliation entries available."
      searchPlaceholder="Search risk input recon…"
    />
  );
}
