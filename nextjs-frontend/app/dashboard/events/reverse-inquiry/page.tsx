"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { eventsGetReverseInquiries } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { SingleDateFilterBar } from "@/components/grid/filter-bar";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { reverseInquirySimulator } from "@/lib/grid-simulators/events";
import { getApiData, getApiError } from "@/lib/utils";

type ReverseInquiryRow = {
  id: number;
  ticker: string;
  company: string;
  inquiry_date: string;
  expiry_date: string;
  deal_point: string;
  agent: string;
  notes: string;
};

const columns = [
  textColumn({
    field: "ticker",
    header: "Ticker",
    pinned: "left",
    minWidth: 100,
  }),
  textColumn({ field: "company", header: "Company", minWidth: 150 }),
  dateColumn({ field: "inquiry_date", header: "Inquiry Date", minWidth: 110 }),
  dateColumn({ field: "expiry_date", header: "Expiry Date", minWidth: 110 }),
  textColumn({ field: "deal_point", header: "Deal Point", minWidth: 110 }),
  textColumn({ field: "agent", header: "Agent", minWidth: 110 }),
  textColumn({ field: "notes", header: "Notes", minWidth: 200 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function ReverseInquiryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ReverseInquiryRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftDate, setDraftDate] = useState("");
  const [appliedDate, setAppliedDate] = useState("");

  const load = useCallback(
    async (date: string) => {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const response = await eventsGetReverseInquiries({
        headers: { Authorization: `Bearer ${token}` },
        query: date ? { position_date: date } : undefined,
      });
      const error = getApiError(response);
      if (error) {
        const status = getStatus(error);
        if (status === 401 || status === 403) {
          router.replace("/login");
          return;
        }
        setErrorMessage("Failed to load reverse inquiries.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as ReverseInquiryRow[]) ?? []);
      setErrorMessage(null);
      setIsLoading(false);
    },
    [router],
  );

  useEffect(() => {
    void load("");
  }, [load]);

  const onApply = () => {
    setAppliedDate(draftDate);
    void load(draftDate);
  };

  const onClear = () => {
    setDraftDate("");
    setAppliedDate("");
    void load("");
  };

  return (
    <DataGrid<ReverseInquiryRow>
      gridId="reverse_inquiry_grid"
      showCompactToggle
      showAutoRefresh
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={() => load(appliedDate)}
      simulateUpdate={reverseInquirySimulator}
      emptyMessage="No reverse inquiries available."
      searchPlaceholder="Search reverse inquiries…"
      filterBar={
        <SingleDateFilterBar
          label="Position Date"
          value={draftDate}
          onChange={setDraftDate}
          onApply={onApply}
          onClear={onClear}
          hasActiveFilters={Boolean(appliedDate)}
        />
      }
    />
  );
}
