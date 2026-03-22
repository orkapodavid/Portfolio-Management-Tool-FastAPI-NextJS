"use client";

import { useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, RowClickedEvent } from "ag-grid-community";
import "@/components/grid-provider";
import { gridTheme } from "@/components/grid-provider";
import DemoLayout from "@/components/demo-layout";
import StatusBadge from "@/components/status-badge";
import { TREE_DATA } from "@/lib/data";
import type { TreeRow } from "@/lib/types";

export default function Demo17Page() {
  const [columns] = useState<ColDef<TreeRow>[]>([
    { field: "name", headerName: "Name", flex: 2 },
    { field: "type", headerName: "Type", width: 100 },
    { field: "size", headerName: "Size", width: 120 },
  ]);
  const [data] = useState<TreeRow[]>(() =>
    TREE_DATA.map((row) => ({ ...row, path: [...row.path] }))
  );
  const [lastEvent, setLastEvent] = useState("Click a row to see its path");

  const onRowClicked = useCallback((event: RowClickedEvent<TreeRow>) => {
    if (event.data) {
      setLastEvent(
        `Clicked: ${event.data.name} (path: ${event.data.path.join(" / ")})`
      );
    }
  }, []);

  return (
    <DemoLayout
      title="17 - Tree Data"
      description="Hierarchical tree data display with expandable folder structure. AG Grid Enterprise tree data feature renders nested paths as an interactive file explorer."
    >
      <div className="flex items-center gap-3 mb-4">
        <StatusBadge lastEvent={lastEvent} />
      </div>

      <div style={{ height: "55vh", width: "100%" }}>
        <AgGridReact<TreeRow>
          theme={gridTheme}
          rowData={data}
          columnDefs={columns}
          treeData={true}
          getDataPath={(data) => data.path}
          autoGroupColumnDef={{
            headerName: "File Explorer",
            minWidth: 300,
            cellRendererParams: { suppressCount: true },
          }}
          groupDefaultExpanded={-1}
          getRowId={(params) => params.data.id}
          onRowClicked={onRowClicked}
        />
      </div>

      <div className="mt-4 p-4 rounded-lg bg-ctp-mantle border border-ctp-surface1">
        <h3 className="text-sm font-semibold text-ctp-text mb-2">
          Path Array Data Structure
        </h3>
        <pre className="text-xs text-ctp-subtext0 overflow-x-auto">
{`// Each row has a path array defining its position in the tree
const treeData = [
  { path: ["Documents"],                        name: "Documents",    type: "folder" },
  { path: ["Documents", "Reports"],             name: "Reports",      type: "folder" },
  { path: ["Documents", "Reports", "Q1.xlsx"],  name: "Q1.xlsx",      type: "file"   },
  { path: ["Pictures"],                         name: "Pictures",     type: "folder" },
  { path: ["Pictures", "vacation.jpg"],         name: "vacation.jpg", type: "file"   },
];

// Grid configuration
<AgGridReact
  treeData={true}
  getDataPath={(data) => data.path}
  groupDefaultExpanded={-1}
/>`}
        </pre>
      </div>
    </DemoLayout>
  );
}
