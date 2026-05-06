"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { reconciliationGetPnlRecon } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type PnlReconRow = {
  id: number;
  underlying: string;
  trade_date: string;
  report_date: string;
  deal_num: string;
  row_index: string;
  pos_loc: string;
  stock_sec_id: string;
  warrant_sec_id: string;
  bond_sec_id: string;
  stock_position: string;
};

const columns = [
  textColumn({ field: "underlying", header: "Underlying", pinned: "left", minWidth: 100 }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  dateColumn({ field: "report_date", header: "Report Date", minWidth: 100 }),
  textColumn({ field: "deal_num", header: "Deal Num", minWidth: 90 }),
  textColumn({ field: "row_index", header: "Row Index", minWidth: 90, align: "right" }),
  textColumn({ field: "pos_loc", header: "Pos Loc", minWidth: 80 }),
  textColumn({ field: "stock_sec_id", header: "Stock SecID", minWidth: 100 }),
  textColumn({ field: "warrant_sec_id", header: "Warrant SecID", minWidth: 110 }),
  textColumn({ field: "bond_sec_id", header: "Bond SecID", minWidth: 100 }),
  textColumn({ field: "stock_position", header: "Stock Position", minWidth: 110, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function PnlReconPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PnlReconRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await reconciliationGetPnlRecon({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load P&L reconciliation.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as PnlReconRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<PnlReconRow>
      gridId="pnl_recon_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No P&L reconciliation entries available."
      searchPlaceholder="Search P&L recon…"
    />
  );
}
