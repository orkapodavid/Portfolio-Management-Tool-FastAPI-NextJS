"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { operationsGetDailyProcedures } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type DailyProcedureRow = {
  id: number;
  check_date: string;
  host_run_date: string;
  scheduled_time: string;
  procedure_name: string;
  status: string;
  error_message: string;
  frequency: string;
  scheduled_day: string;
  created_by: string;
  created_time: string;
};

const columns = [
  textColumn({ field: "procedure_name", header: "Procedure", pinned: "left", minWidth: 150 }),
  dateColumn({ field: "check_date", header: "Check Date", minWidth: 110 }),
  dateColumn({ field: "host_run_date", header: "Host Run Date", minWidth: 120 }),
  textColumn({ field: "scheduled_time", header: "Scheduled Time", minWidth: 120 }),
  textColumn({ field: "status", header: "Status", minWidth: 100 }),
  textColumn({ field: "error_message", header: "Error Message", minWidth: 150 }),
  textColumn({ field: "frequency", header: "Frequency", minWidth: 100 }),
  textColumn({ field: "scheduled_day", header: "Scheduled Day", minWidth: 110 }),
  textColumn({ field: "created_by", header: "Created By", minWidth: 100 }),
  textColumn({ field: "created_time", header: "Created Time", minWidth: 130 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function DailyProceduresPage() {
  const router = useRouter();
  const [rows, setRows] = useState<DailyProcedureRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await operationsGetDailyProcedures({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load daily procedures.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as DailyProcedureRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<DailyProcedureRow>
      gridId="daily_procedures_grid"
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
      emptyMessage="No daily procedures available."
      searchPlaceholder="Search procedures…"
    />
  );
}
