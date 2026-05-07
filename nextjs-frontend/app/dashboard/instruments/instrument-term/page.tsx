"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { instrumentsGetInstrumentTerm } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { instrumentTermSimulator } from "@/lib/grid-simulators/instruments";
import { getApiData, getApiError } from "@/lib/utils";

type InstrumentTermRow = {
  id: number;
  deal_num: string;
  detail_id: string;
  underlying: string;
  ticker: string;
  company_name: string;
  sec_type: string;
  effective_date: string;
  maturity_date: string;
  first_reset_da: string;
};

const columns = [
  textColumn({
    field: "deal_num",
    header: "Deal Num",
    pinned: "left",
    minWidth: 90,
  }),
  textColumn({ field: "detail_id", header: "Detail ID", minWidth: 90 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "ticker", header: "Ticker", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  dateColumn({
    field: "effective_date",
    header: "Effective Date",
    minWidth: 110,
  }),
  dateColumn({
    field: "maturity_date",
    header: "Maturity Date",
    minWidth: 110,
  }),
  dateColumn({
    field: "first_reset_da",
    header: "First Reset Da",
    minWidth: 120,
  }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function InstrumentTermPage() {
  const router = useRouter();
  const [rows, setRows] = useState<InstrumentTermRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await instrumentsGetInstrumentTerm({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load instrument terms.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as InstrumentTermRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<InstrumentTermRow>
      gridId="instrument_term_grid"
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
      simulateUpdate={instrumentTermSimulator}
      emptyMessage="No instrument term entries available."
      searchPlaceholder="Search instrument terms…"
    />
  );
}
