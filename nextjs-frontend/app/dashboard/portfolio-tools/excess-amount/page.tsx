"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { portfolioToolsGetExcessAmount } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type ExcessAmountRow = {
  id: number;
  deal_num: string;
  underlying: string;
  ticker: string;
  company_name: string;
  warrants: string;
  excess_amount: string;
  threshold: string;
  cb_redeem: string;
  redeem: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "deal_num", header: "Deal Num", minWidth: 90 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "warrants", header: "Warrants", minWidth: 100, align: "right" }),
  textColumn({ field: "excess_amount", header: "Excess Amount", minWidth: 120, align: "right" }),
  textColumn({ field: "threshold", header: "Threshold", minWidth: 100, align: "right" }),
  textColumn({ field: "cb_redeem", header: "CB Redeem", minWidth: 100 }),
  textColumn({ field: "redeem", header: "Redeem", minWidth: 90 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function ExcessAmountPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ExcessAmountRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await portfolioToolsGetExcessAmount({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load excess amount.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as ExcessAmountRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<ExcessAmountRow>
      gridId="excess_amount_grid"
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
      emptyMessage="No excess amount entries available."
      searchPlaceholder="Search excess amount…"
    />
  );
}
