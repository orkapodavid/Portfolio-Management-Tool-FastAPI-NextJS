"use client";

import { useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import { SAMPLE_DATA } from "@/lib/data";
import { getBasicColumns } from "@/lib/columns";
import type { StockRow } from "@/lib/types";

export default function Demo22Page() {
  const gridRef = useRef<AgGridReact<StockRow>>(null);
  const [columns] = useState<ColDef[]>(getBasicColumns);

  const showFilterBuilder = useCallback(() => {
    gridRef.current?.api.showAdvancedFilterBuilder();
  }, []);

  const clearFilters = useCallback(() => {
    gridRef.current?.api.setAdvancedFilterModel(null);
  }, []);

  return (
    <DemoLayout
      title="22 - Advanced Filter"
      description="Enterprise advanced filter builder. Build complex filter expressions with AND/OR conditions across multiple columns using the visual filter builder."
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={showFilterBuilder}
          className="px-4 py-2 rounded-lg bg-ctp-blue/20 text-ctp-blue border border-ctp-blue/30 text-sm font-medium hover:bg-ctp-blue/30 transition-colors"
        >
          Show Filter Builder
        </button>
        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-lg bg-ctp-overlay0/20 text-ctp-subtext0 border border-ctp-overlay0/30 text-sm font-medium hover:bg-ctp-overlay0/30 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <p className="text-xs text-ctp-subtext0 mb-4">
        This demo uses AG Grid Enterprise features. The Advanced Filter Builder provides a visual interface for constructing complex filter conditions.
      </p>

      <div style={{ height: "60vh", width: "100%" }}>
        <AgGridReact<StockRow>
          ref={gridRef}
          theme={gridTheme}
          rowData={SAMPLE_DATA}
          columnDefs={columns}
          enableAdvancedFilter={true}
          sideBar={true}
          getRowId={(params) => params.data.id}
        />
      </div>
    </DemoLayout>
  );
}
