"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { reconciliationGetSettlementRecon } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { SingleDateFilterBar } from "@/components/grid/filter-bar";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type SettlementReconRow = {
  id: number;
  ticker: string;
  trade_date: string;
  ml_report_date: string;
  underlying: string;
  company_name: string;
  pos_loc: string;
  currency: string;
  sec_type: string;
  position_settled: string;
  ml_inventory: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  dateColumn({ field: "ml_report_date", header: "ML Report Date", minWidth: 110 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "pos_loc", header: "Pos Loc", minWidth: 80 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "position_settled", header: "Position Settled", minWidth: 120, align: "right" }),
  textColumn({ field: "ml_inventory", header: "ML Inventory", minWidth: 110, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function SettlementReconPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SettlementReconRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftDate, setDraftDate] = useState("");
  const [appliedDate, setAppliedDate] = useState("");

  const load = useCallback(
    async (date: string) => {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const response = await reconciliationGetSettlementRecon({
        headers: { Authorization: `Bearer ${token}` },
        query: date ? { trade_date: date } : undefined,
      });
      const error = getApiError(response);
      if (error) {
        const status = getStatus(error);
        if (status === 401 || status === 403) {
          router.replace("/login");
          return;
        }
        setErrorMessage("Failed to load settlement reconciliation.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as SettlementReconRow[]) ?? []);
      setErrorMessage(null);
      setIsLoading(false);
    },
    [router]
  );

  useEffect(() => {
    void load("");
  }, [load]);

  const onApply = () => {
    setAppliedDate(draftDate);
    void load(draftDate);
  };

  const onClear = () => {
    setDraftDate("");
    setAppliedDate("");
    void load("");
  };

  return (
    <DataGrid<SettlementReconRow>
      gridId="settlement_recon_grid"
      showCompactToggle
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={() => load(appliedDate)}
      emptyMessage="No settlement reconciliation entries available."
      searchPlaceholder="Search settlement recon…"
      filterBar={
        <SingleDateFilterBar
          label="Trade Date"
          value={draftDate}
          onChange={setDraftDate}
          onApply={onApply}
          onClear={onClear}
          hasActiveFilters={Boolean(appliedDate)}
        />
      }
    />
  );
}
