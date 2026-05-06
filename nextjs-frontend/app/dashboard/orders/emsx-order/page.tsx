"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ordersGetOrders } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type OrderRow = {
  id: number;
  sequence: number;
  underlying: string;
  ticker: string;
  broker: string;
  pos_loc: string;
  side: string;
  status: string;
  emsx_amount: string;
  emsx_routed: string;
  emsx_working: string;
  emsx_filled: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "sequence", header: "Sequence", minWidth: 90, align: "right" }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 110 }),
  textColumn({ field: "broker", header: "Broker", minWidth: 90 }),
  textColumn({ field: "pos_loc", header: "Pos Loc", minWidth: 80 }),
  textColumn({ field: "side", header: "Side", minWidth: 80 }),
  textColumn({ field: "status", header: "Status", minWidth: 100 }),
  textColumn({ field: "emsx_amount", header: "EMSX Amount", minWidth: 120, align: "right" }),
  textColumn({ field: "emsx_routed", header: "EMSX Routed", minWidth: 110, align: "right" }),
  textColumn({ field: "emsx_working", header: "EMSX Working", minWidth: 120, align: "right" }),
  textColumn({ field: "emsx_filled", header: "EMSX Filled", minWidth: 110, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function EmsxOrderPage() {
  const router = useRouter();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await ordersGetOrders({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load EMSX orders.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as OrderRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<OrderRow>
      gridId="emsx_order_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No EMSX orders available."
      searchPlaceholder="Search orders…"
    />
  );
}
