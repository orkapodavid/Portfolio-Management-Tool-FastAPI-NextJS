"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company", header: "Company" },
  { key: "sector", header: "Sector" },
  { key: "currency", header: "CCY" },
  { key: "fmat_cap", header: "Mkt Cap", align: "right" as const },
  { key: "chg_1d_pct", header: "Chg 1D%", align: "right" as const },
];

const mockData = [
  { id: 1, ticker: "AAPL", company: "Apple Inc.", sector: "Technology", currency: "USD", fmat_cap: "2.95T", chg_1d_pct: "+0.5%" },
  { id: 2, ticker: "MSFT", company: "Microsoft Corp.", sector: "Technology", currency: "USD", fmat_cap: "3.10T", chg_1d_pct: "+1.2%" },
  { id: 3, ticker: "7203.T", company: "Toyota Motor", sector: "Auto", currency: "JPY", fmat_cap: "42.5T", chg_1d_pct: "+0.3%" },
  { id: 4, ticker: "9984.T", company: "SoftBank Group", sector: "Technology", currency: "JPY", fmat_cap: "12.8T", chg_1d_pct: "-1.5%" },
];

export default function TickerDataPage() {
  return <DataTable columns={columns} data={mockData} />;
}
