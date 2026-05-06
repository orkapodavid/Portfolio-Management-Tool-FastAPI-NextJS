"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { portfolioToolsGetDealIndication } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type DealIndicationRow = {
  id: number;
  ticker: string;
  company_name: string;
  identification: string;
  deal_type: string;
  agent: string;
  captain: string;
  indication_date: string;
  currency: string;
  market_cap_loc: string;
  gross_proceed_loc: string;
  indication_amount: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "identification", header: "Identification", minWidth: 120 }),
  textColumn({ field: "deal_type", header: "Deal Type", minWidth: 100 }),
  textColumn({ field: "agent", header: "Agent", minWidth: 100 }),
  textColumn({ field: "captain", header: "Deal Captain", minWidth: 110 }),
  dateColumn({ field: "indication_date", header: "Indication Date", minWidth: 120 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  textColumn({ field: "market_cap_loc", header: "Market Cap LOC", minWidth: 130, align: "right" }),
  textColumn({ field: "gross_proceed_loc", header: "Gross Proceed LOC", minWidth: 140, align: "right" }),
  textColumn({ field: "indication_amount", header: "Indication Amount", minWidth: 140, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function DealIndicationPage() {
  const router = useRouter();
  const [rows, setRows] = useState<DealIndicationRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await portfolioToolsGetDealIndication({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load deal indication.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as DealIndicationRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<DealIndicationRow>
      gridId="deal_indication_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No deal indication entries available."
      searchPlaceholder="Search deal indication…"
    />
  );
}
