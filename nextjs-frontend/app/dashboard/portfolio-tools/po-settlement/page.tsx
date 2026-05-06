"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { portfolioToolsGetPoSettlement } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type PoSettlementRow = {
  id: number;
  deal_num: string;
  ticker: string;
  company_name: string;
  structure: string;
  currency: string;
  fx_rate: string;
  last_price: string;
  current_position: string;
  shares_allocated: string;
  shares_swap: string;
  shares_hedged: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "deal_num", header: "Deal Num", minWidth: 90 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "structure", header: "Structure", minWidth: 100 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  textColumn({ field: "fx_rate", header: "FX Rate", minWidth: 90, align: "right" }),
  textColumn({ field: "last_price", header: "Last Price", minWidth: 100, align: "right" }),
  textColumn({ field: "current_position", header: "Current Position", minWidth: 130, align: "right" }),
  textColumn({ field: "shares_allocated", header: "Shares Allocated", minWidth: 130, align: "right" }),
  textColumn({ field: "shares_swap", header: "Shares in Swap", minWidth: 120, align: "right" }),
  textColumn({ field: "shares_hedged", header: "Shares Hedged", minWidth: 120, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function PoSettlementPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PoSettlementRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await portfolioToolsGetPoSettlement({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load PO settlement.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as PoSettlementRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<PoSettlementRow>
      gridId="po_settlement_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No PO settlement entries available."
      searchPlaceholder="Search PO settlement…"
    />
  );
}
