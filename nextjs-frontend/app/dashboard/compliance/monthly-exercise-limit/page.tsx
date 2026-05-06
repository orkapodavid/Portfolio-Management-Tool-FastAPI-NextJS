"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { complianceGetMonthlyExerciseLimit } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { SingleDateFilterBar } from "@/components/grid/filter-bar";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type MonthlyExerciseLimitRow = {
  id: number;
  underlying: string;
  ticker: string;
  company_name: string;
  sec_type: string;
  original_nosh: string;
  original_quantity: string;
  monthly_exercised_quantity: string;
  monthly_exercised_pct: string;
  monthly_sal: string;
};

const columns = [
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "original_nosh", header: "Original Nosh", minWidth: 110, align: "right" }),
  textColumn({ field: "original_quantity", header: "Original Quantity", minWidth: 120, align: "right" }),
  textColumn({ field: "monthly_exercised_quantity", header: "Monthly Exercised Qty", minWidth: 150, align: "right" }),
  textColumn({ field: "monthly_exercised_pct", header: "Monthly Exercised %", minWidth: 130, align: "right" }),
  textColumn({ field: "monthly_sal", header: "Monthly Sal", minWidth: 100, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function MonthlyExerciseLimitPage() {
  const router = useRouter();
  const [rows, setRows] = useState<MonthlyExerciseLimitRow[]>([]);
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
      const response = await complianceGetMonthlyExerciseLimit({
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
        setErrorMessage("Failed to load monthly exercise limit.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as MonthlyExerciseLimitRow[]) ?? []);
      setErrorMessage(null);
      setIsLoading(false);
    },
    [router]
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

  const onRefresh = () => load(appliedDate);

  return (
    <DataGrid<MonthlyExerciseLimitRow>
      gridId="monthly_exercise_limit_grid"
      showCompactToggle
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={onRefresh}
      emptyMessage="No monthly exercise limit entries available."
      searchPlaceholder="Search monthly exercise limit…"
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
