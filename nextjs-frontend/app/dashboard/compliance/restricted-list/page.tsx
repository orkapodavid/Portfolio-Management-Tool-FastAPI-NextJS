"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { complianceGetRestrictedList } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type RestrictedListRow = {
  id: number;
  ticker: string;
  company_name: string;
  in_emsx: string | null;
  compliance_type: string;
  firm_block: string | null;
  compliance_start: string | null;
  nda_end: string | null;
  mnpi_end: string | null;
  wc_end: string | null;
};

const columns = [
  textColumn({
    field: "ticker",
    header: "Ticker",
    pinned: "left",
    minWidth: 100,
    enableRowGroup: true,
  }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "in_emsx", header: "In EMSX?", minWidth: 80 }),
  textColumn({
    field: "compliance_type",
    header: "Compliance Type",
    minWidth: 120,
    enableRowGroup: true,
  }),
  textColumn({ field: "firm_block", header: "Firm Block", minWidth: 100 }),
  textColumn({
    field: "compliance_start",
    header: "Compliance Start",
    minWidth: 120,
  }),
  textColumn({ field: "nda_end", header: "NDA End", minWidth: 90 }),
  textColumn({ field: "mnpi_end", header: "MNPI End", minWidth: 90 }),
  textColumn({ field: "wc_end", header: "WC End", minWidth: 90 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function RestrictedListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RestrictedListRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await complianceGetRestrictedList({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load restricted list.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as RestrictedListRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<RestrictedListRow>
      gridId="restricted_list_grid"
      showCompactToggle
      showRowGroupPanel
      groupDefaultExpanded={-1}
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No restricted list entries available."
      searchPlaceholder="Search restricted list…"
    />
  );
}
