"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { instrumentsGetSpecialTerms } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type SpecialTermRow = {
  id: number;
  deal_num: string;
  ticker: string;
  company_name: string;
  sec_type: string;
  pos_loc: string;
  account: string;
  effective_date: string;
  position: string;
};

const columns = [
  textColumn({ field: "deal_num", header: "Deal Num", pinned: "left", minWidth: 90 }),
  textColumn({ field: "ticker", header: "Ticker", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "pos_loc", header: "Position Location", minWidth: 130 }),
  textColumn({ field: "account", header: "Account", minWidth: 100 }),
  dateColumn({ field: "effective_date", header: "Effective Date", minWidth: 110 }),
  textColumn({ field: "position", header: "Position", minWidth: 90, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function SpecialTermsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SpecialTermRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await instrumentsGetSpecialTerms({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load special terms.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as SpecialTermRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<SpecialTermRow>
      gridId="special_term_grid"
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
      emptyMessage="No special terms available."
      searchPlaceholder="Search special terms…"
    />
  );
}
