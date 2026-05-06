"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { complianceGetBeneficialOwnership } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { SingleDateFilterBar } from "@/components/grid/filter-bar";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type BeneficialOwnershipRow = {
  id: number;
  trade_date?: string;
  ticker: string;
  company_name: string;
  nosh_reported?: string;
  nosh_bbg?: string;
  nosh_proforma?: string;
  stock_shares?: string;
  warrant_shares?: string;
  bond_shares?: string;
  total_shares?: string;
};

const columns = [
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "nosh_reported", header: "NOSH (Reported)", minWidth: 120, align: "right" }),
  textColumn({ field: "nosh_bbg", header: "NOSH (BBG)", minWidth: 100, align: "right" }),
  textColumn({ field: "nosh_proforma", header: "NOSH Proforma", minWidth: 120, align: "right" }),
  textColumn({ field: "stock_shares", header: "Stock Shares", minWidth: 100, align: "right" }),
  textColumn({ field: "warrant_shares", header: "Warrant Shares", minWidth: 110, align: "right" }),
  textColumn({ field: "bond_shares", header: "Bond Shares", minWidth: 100, align: "right" }),
  textColumn({ field: "total_shares", header: "Total Shares", minWidth: 100, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function BeneficialOwnershipPage() {
  const router = useRouter();
  const [rows, setRows] = useState<BeneficialOwnershipRow[]>([]);
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
      const response = await complianceGetBeneficialOwnership({
        headers: { Authorization: `Bearer ${token}` },
        query: date ? { position_date: date } : undefined,
      });
      const error = getApiError(response);
      if (error) {
        const status = getStatus(error);
        if (status === 401 || status === 403) {
          router.replace("/login");
          return;
        }
        setErrorMessage("Failed to load beneficial ownership.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as BeneficialOwnershipRow[]) ?? []);
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
    <DataGrid<BeneficialOwnershipRow>
      gridId="beneficial_ownership_grid"
      showCompactToggle
      showAutoRefresh
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={() => load(appliedDate)}
      emptyMessage="No beneficial ownership entries available."
      searchPlaceholder="Search beneficial ownership…"
      filterBar={
        <SingleDateFilterBar
          label="Position Date"
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
