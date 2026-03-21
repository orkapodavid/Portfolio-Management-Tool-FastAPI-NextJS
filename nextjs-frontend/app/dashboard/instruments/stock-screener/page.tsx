"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company", header: "Company" },
  { key: "sector", header: "Sector" },
  { key: "market_cap", header: "Mkt Cap", align: "right" as const },
  { key: "pe_ratio", header: "P/E", align: "right" as const },
  { key: "dividend_yield", header: "Div Yield", align: "right" as const },
  { key: "volume", header: "Volume", align: "right" as const },
  { key: "chg_1d_pct", header: "Chg%", align: "right" as const },
];

const mockData = [
  { id: 1, ticker: "NVDA", company: "NVIDIA Corp.", sector: "Semiconductors", market_cap: "2.15T", pe_ratio: "68.5", dividend_yield: "0.02%", volume: "45.6M", chg_1d_pct: "+3.5%" },
  { id: 2, ticker: "AAPL", company: "Apple Inc.", sector: "Technology", market_cap: "2.95T", pe_ratio: "29.5", dividend_yield: "0.55%", volume: "54.2M", chg_1d_pct: "+0.5%" },
  { id: 3, ticker: "TSLA", company: "Tesla Inc.", sector: "Auto", market_cap: "780B", pe_ratio: "62.3", dividend_yield: "0.00%", volume: "98.2M", chg_1d_pct: "-2.1%" },
];

export default function StockScreenerPage() {
  return <DataTable columns={columns} data={mockData} />;
}
