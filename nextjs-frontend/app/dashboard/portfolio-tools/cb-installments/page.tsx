"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { portfolioToolsGetCbInstallments } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { SingleDateFilterBar } from "@/components/grid/filter-bar";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { cbInstallmentsSimulator } from "@/lib/grid-simulators/portfolio-tools";
import { getApiData, getApiError } from "@/lib/utils";

type CbInstallmentRow = {
  id: number;
  underlying: string;
  ticker: string;
  currency: string;
  installment_date: string;
  total_amount: string;
  outstanding: string;
  redeemed: string;
  deferred: string;
  converted: string;
  installment_amount: string;
  period: string;
};

const columns = [
  textColumn({
    field: "ticker",
    header: "Ticker",
    pinned: "left",
    minWidth: 100,
  }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  dateColumn({
    field: "installment_date",
    header: "Installment Date",
    minWidth: 130,
  }),
  textColumn({
    field: "total_amount",
    header: "Total Amount",
    minWidth: 110,
    align: "right",
  }),
  textColumn({
    field: "outstanding",
    header: "Outstanding Amount",
    minWidth: 140,
    align: "right",
  }),
  textColumn({
    field: "redeemed",
    header: "Redeemed Amount",
    minWidth: 130,
    align: "right",
  }),
  textColumn({
    field: "deferred",
    header: "Deferred",
    minWidth: 100,
    align: "right",
  }),
  textColumn({
    field: "converted",
    header: "Converted",
    minWidth: 100,
    align: "right",
  }),
  textColumn({
    field: "installment_amount",
    header: "Installment Amount",
    minWidth: 140,
    align: "right",
  }),
  textColumn({ field: "period", header: "Period", minWidth: 90 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function CbInstallmentsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CbInstallmentRow[]>([]);
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
      const response = await portfolioToolsGetCbInstallments({
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
        setErrorMessage("Failed to load CB installments.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as CbInstallmentRow[]) ?? []);
      setErrorMessage(null);
      setIsLoading(false);
    },
    [router],
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
    <DataGrid<CbInstallmentRow>
      gridId="cb_installments_grid"
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
      simulateUpdate={cbInstallmentsSimulator}
      emptyMessage="No CB installments available."
      searchPlaceholder="Search CB installments…"
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
