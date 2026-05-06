"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  operationsGetOperationProcesses,
  operationsKillProcess,
  operationsRerunProcess,
} from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getOperationsContextMenuItems } from "@/components/operations/operations-context-menu";
import { getAuthToken } from "@/lib/auth/token-storage";
import { operationProcessSimulator } from "@/lib/grid-simulators/operations";
import { getApiData, getApiError } from "@/lib/utils";

type OperationProcessRow = {
  id: number;
  process: string;
  status: string;
  last_run_time: string;
};

const columns = [
  textColumn({ field: "process", header: "Process", pinned: "left", minWidth: 150 }),
  textColumn({ field: "status", header: "Status", minWidth: 100 }),
  textColumn({ field: "last_run_time", header: "Last Run Time", minWidth: 150 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function OperationProcessPage() {
  const router = useRouter();
  const [rows, setRows] = useState<OperationProcessRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await operationsGetOperationProcesses({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load operation processes.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as OperationProcessRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const contextMenu = useMemo(
    () =>
      getOperationsContextMenuItems({
        onRerun: async ({ id, process_name }) => {
          const token = getAuthToken();
          if (!token) return;
          await operationsRerunProcess({
            headers: { Authorization: `Bearer ${token}` },
            path: { process_id: id },
            body: { process_name },
          });
          void load();
        },
        onKill: async ({ id, process_name }) => {
          const token = getAuthToken();
          if (!token) return;
          await operationsKillProcess({
            headers: { Authorization: `Bearer ${token}` },
            path: { process_id: id },
            body: { process_name },
          });
          void load();
        },
      }),
    [load],
  );

  return (
    <DataGrid<OperationProcessRow>
      gridId="operation_process_grid"
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
      simulateUpdate={operationProcessSimulator}
      emptyMessage="No operation processes available."
      searchPlaceholder="Search processes…"
      getContextMenuItems={contextMenu}
    />
  );
}
