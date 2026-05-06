"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { instrumentsGetInstrumentData } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type InstrumentDataRow = {
  id: number;
  deal_num: string;
  detail_id: string;
  underlying: string;
  ticker: string;
  company_name: string;
  sec_id: string;
  sec_type: string;
  pos_loc: string;
  account: string;
};

const columns = [
  textColumn({ field: "deal_num", header: "Deal Num", pinned: "left", minWidth: 90 }),
  textColumn({ field: "detail_id", header: "Detail ID", minWidth: 90 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "ticker", header: "Ticker", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_id", header: "SecID", minWidth: 90 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "pos_loc", header: "Position Location", minWidth: 130 }),
  textColumn({ field: "account", header: "Account", minWidth: 100 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function InstrumentDataPage() {
  const router = useRouter();
  const [rows, setRows] = useState<InstrumentDataRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await instrumentsGetInstrumentData({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load instrument data.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as InstrumentDataRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<InstrumentDataRow>
      gridId="instrument_data_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No instrument data entries available."
      searchPlaceholder="Search instrument data…"
    />
  );
}
