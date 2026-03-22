"use client";

import { AllEnterpriseModule } from "ag-grid-enterprise";
import { ModuleRegistry, themeQuartz } from "ag-grid-community";

// Register all enterprise modules once
ModuleRegistry.registerModules([AllEnterpriseModule]);

// Catppuccin Mocha dark theme for AG Grid
export const gridTheme = themeQuartz.withParams({
  accentColor: "#89b4fa",
  backgroundColor: "#1e1e2e",
  foregroundColor: "#cdd6f4",
  headerBackgroundColor: "#181825",
  oddRowBackgroundColor: "#11111b",
  selectedRowBackgroundColor: "rgba(137, 180, 250, 0.15)",
  borderColor: "#45475a",
  headerFontSize: 13,
  fontSize: 13,
  spacing: 6,
}, "dark");

// Shared defaultColDef with cell change flash enabled (v31.2+ column-level API)
export const defaultColDef = {
  enableCellChangeFlash: true,
};
