"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { portfolioToolsGetPayToHold } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type PayToHoldRow = {
  id: number;
  trade_date: string;
  ticker: string;
  currency: string;
  counter_party: string;
  side: string;
  sl_rate: string;
  pth_amount_sod: string;
  pth_amount: string;
  emsx_order: string;
  emsx_remark: string;
  emsx_working: string;
  emsx_order_col: string;
  emsx_filled: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  textColumn({ field: "counter_party", header: "Counter Party", minWidth: 110 }),
  textColumn({ field: "side", header: "Side", minWidth: 80 }),
  textColumn({ field: "sl_rate", header: "SL Rate", minWidth: 90, align: "right" }),
  textColumn({ field: "pth_amount_sod", header: "PTH Amount SOD", minWidth: 130, align: "right" }),
  textColumn({ field: "pth_amount", header: "PTH Amount", minWidth: 110, align: "right" }),
  textColumn({ field: "emsx_order", header: "EMSX Order", minWidth: 100 }),
  textColumn({ field: "emsx_remark", header: "EMSX Remark", minWidth: 110 }),
  textColumn({ field: "emsx_working", header: "EMSX Working", minWidth: 110 }),
  textColumn({ field: "emsx_order_col", header: "EMSX Order Col", minWidth: 120 }),
  textColumn({ field: "emsx_filled", header: "EMSX Filled", minWidth: 100 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function PayToHoldPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PayToHoldRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await portfolioToolsGetPayToHold({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load pay-to-hold.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as PayToHoldRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<PayToHoldRow>
      gridId="pay_to_hold_grid"
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
      emptyMessage="No pay-to-hold entries available."
      searchPlaceholder="Search pay-to-hold…"
    />
  );
}
