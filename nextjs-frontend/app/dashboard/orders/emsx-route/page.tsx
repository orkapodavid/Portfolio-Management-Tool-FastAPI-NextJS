"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ordersGetOrderRoutes } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { numberColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type RouteRow = {
  id: number;
  order_id: number;
  route_id: string;
  broker: string;
  quantity: number;
  filled_quantity: number;
  avg_price: string;
  status: string;
};

const columns = [
  textColumn({ field: "route_id", header: "Route ID", pinned: "left", minWidth: 110 }),
  numberColumn({ field: "order_id", header: "Order ID", minWidth: 90, decimals: 0 }),
  textColumn({ field: "broker", header: "Broker", minWidth: 90 }),
  numberColumn({ field: "quantity", header: "Quantity", minWidth: 100, decimals: 0 }),
  numberColumn({ field: "filled_quantity", header: "Filled Quantity", minWidth: 130, decimals: 0 }),
  textColumn({ field: "avg_price", header: "Avg Price", minWidth: 100, align: "right" }),
  textColumn({ field: "status", header: "Status", minWidth: 100 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function EmsxRoutePage() {
  const router = useRouter();
  const [rows, setRows] = useState<RouteRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await ordersGetOrderRoutes({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load EMSX routes.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as RouteRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<RouteRow>
      gridId="emsx_route_grid"
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
      emptyMessage="No EMSX routes available."
      searchPlaceholder="Search routes…"
    />
  );
}
