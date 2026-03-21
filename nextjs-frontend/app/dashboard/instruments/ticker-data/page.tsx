"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company", header: "Company" },
  { key: "sector", header: "Sector" },
  { key: "currency", header: "CCY" },
  { key: "market_cap", header: "Mkt Cap", align: "right" as const },
  { key: "pe_ratio", header: "P/E", align: "right" as const },
  { key: "chg_1d_pct", header: "Chg 1D%", align: "right" as const },
];

const mockData = [
  { id: 1, ticker: "AAPL", company: "Apple Inc.", sector: "Technology", currency: "USD", market_cap: "2.95T", pe_ratio: "29.5", chg_1d_pct: "+0.5%" },
  { id: 2, ticker: "MSFT", company: "Microsoft Corp.", sector: "Technology", currency: "USD", market_cap: "3.10T", pe_ratio: "35.2", chg_1d_pct: "+1.2%" },
  { id: 3, ticker: "7203.T", company: "Toyota Motor", sector: "Auto", currency: "JPY", market_cap: "42.5T", pe_ratio: "10.8", chg_1d_pct: "+0.3%" },
  { id: 4, ticker: "NVDA", company: "NVIDIA Corp.", sector: "Semiconductors", currency: "USD", market_cap: "2.15T", pe_ratio: "68.5", chg_1d_pct: "+3.5%" },
];

export default function InstrumentTickerDataPage() {
  return <DataTable columns={columns} data={mockData} />;
}
