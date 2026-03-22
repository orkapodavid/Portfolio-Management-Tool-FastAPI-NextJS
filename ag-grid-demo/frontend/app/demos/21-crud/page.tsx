"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme, defaultColDef } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { EMPLOYEE_DATA, API_BASE } from "@/lib/data";
import { getCrudColumns } from "@/lib/columns";
import type { EmployeeRow } from "@/lib/types";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export default function Demo21Page() {
  const [columns] = useState<ColDef[]>(getCrudColumns);
  const [data, setData] = useState<EmployeeRow[]>(() =>
    EMPLOYEE_DATA.map((row) => ({ ...row }))
  );
  const [nextId, setNextId] = useState(6);
  const [lastAction, setLastAction] = useState("Ready");
  const [useApi, setUseApi] = useState(true);
  const checkedApiRef = useRef(false);

  // Check if backend is available on mount
  useEffect(() => {
    if (checkedApiRef.current) return;
    checkedApiRef.current = true;
    apiFetch<EmployeeRow[]>("/api/crud/employees")
      .then((rows) => {
        setData(rows);
        setLastAction("Loaded from API");
      })
      .catch(() => {
        setUseApi(false);
        setLastAction("Ready (local mode - backend unavailable)");
      });
  }, []);

  const addRow = useCallback(async () => {
    const newRow: EmployeeRow = {
      id: nextId,
      name: "New Employee",
      email: "new@example.com",
      department: "Engineering",
      salary: 50000,
    };

    if (useApi) {
      try {
        const created = await apiFetch<EmployeeRow>("/api/crud/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newRow.name,
            email: newRow.email,
            department: newRow.department,
            salary: newRow.salary,
          }),
        });
        setData((prev) => [...prev, created]);
        setNextId(created.id + 1);
        setLastAction(`Added row via API (id: ${created.id})`);
        return;
      } catch {
        setUseApi(false);
      }
    }

    setData((prev) => [...prev, newRow]);
    setNextId((prev) => prev + 1);
    setLastAction(`Added row locally (id: ${nextId})`);
  }, [nextId, useApi]);

  const deleteLast = useCallback(async () => {
    if (data.length === 0) return;
    const last = data[data.length - 1];

    if (useApi) {
      try {
        await apiFetch<unknown>(`/api/crud/employees/${last.id}`, {
          method: "DELETE",
        });
        setData((prev) => prev.slice(0, -1));
        setLastAction(`Deleted via API: ${last.name}`);
        return;
      } catch {
        setUseApi(false);
      }
    }

    setData((prev) => prev.slice(0, -1));
    setLastAction(`Deleted locally: ${last.name}`);
  }, [data, useApi]);

  const reset = useCallback(async () => {
    if (useApi) {
      try {
        await apiFetch<unknown>("/api/crud/employees/reset", { method: "POST" });
        const rows = await apiFetch<EmployeeRow[]>("/api/crud/employees");
        setData(rows);
        setNextId(6);
        setLastAction("Reset via API");
        return;
      } catch {
        setUseApi(false);
      }
    }

    setData(EMPLOYEE_DATA.map((row) => ({ ...row })));
    setNextId(6);
    setLastAction("Reset to local data");
  }, [useApi]);

  const onCellValueChanged = useCallback(
    async (event: CellValueChangedEvent<EmployeeRow>) => {
      const { data: rowData, colDef, newValue, oldValue } = event;
      const field = colDef.field as string;

      if (useApi) {
        try {
          await apiFetch<unknown>(`/api/crud/employees/${rowData.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: newValue }),
          });
          // API accepted - update local state to match
          setData((prev) =>
            prev.map((row) =>
              row.id === rowData.id ? { ...row, [field]: newValue } : row
            )
          );
          setLastAction(`Updated ${field} via API for ${rowData.name}`);
          return;
        } catch (err) {
          // 422 = validation error, revert the cell; other errors = fall back to local
          const isValidationError = err instanceof Error && err.message.includes("422");
          if (isValidationError) {
            // Revert the cell edit
            setData((prev) =>
              prev.map((row) =>
                row.id === rowData.id ? { ...row, [field]: oldValue } : row
              )
            );
            setLastAction(`Validation failed: ${field} rejected by API`);
            return;
          }
          setUseApi(false);
        }
      }

      // Local mode: apply edit directly
      setData((prev) =>
        prev.map((row) =>
          row.id === rowData.id ? { ...row, [field]: newValue } : row
        )
      );
      setLastAction(`Updated ${field} locally for ${rowData.name}`);
    },
    [useApi]
  );

  return (
    <DemoLayout
      title="21 - CRUD"
      description="Full CRUD (Create, Read, Update, Delete) operations backed by FastAPI REST endpoints. Falls back to local state if backend is unavailable."
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={addRow}
          className="px-4 py-2 rounded-lg bg-ctp-green/20 text-ctp-green border border-ctp-green/30 text-sm font-medium hover:bg-ctp-green/30 transition-colors"
        >
          Add Row
        </button>
        <button
          onClick={deleteLast}
          className="px-4 py-2 rounded-lg bg-ctp-red/20 text-ctp-red border border-ctp-red/30 text-sm font-medium hover:bg-ctp-red/30 transition-colors"
        >
          Delete Last
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-ctp-overlay0/20 text-ctp-subtext0 border border-ctp-overlay0/30 text-sm font-medium hover:bg-ctp-overlay0/30 transition-colors"
        >
          Reset
        </button>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${
            useApi
              ? "bg-ctp-teal/20 text-ctp-teal border-ctp-teal/30"
              : "bg-ctp-yellow/20 text-ctp-yellow border-ctp-yellow/30"
          }`}
        >
          {useApi ? "API" : "Local"}
        </span>
        <StatusBadge lastEvent={lastAction} />
      </div>

      <div style={{ height: "50vh", width: "100%" }}>
        <AgGridReact<EmployeeRow>
          theme={gridTheme}
            defaultColDef={defaultColDef}
          rowData={data}
          columnDefs={columns}
          onCellValueChanged={onCellValueChanged}
          getRowId={(params) => String(params.data.id)}
        />
      </div>
    </DemoLayout>
  );
}
