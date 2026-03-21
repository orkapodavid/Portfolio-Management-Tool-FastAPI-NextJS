"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "last_price", header: "Last Price", align: "right" as const },
  { key: "bid", header: "Bid", align: "right" as const },
  { key: "ask", header: "Ask", align: "right" as const },
  { key: "vwap_price", header: "VWAP", align: "right" as const },
  { key: "last_volume", header: "Volume", align: "right" as const },
  { key: "chg_1d_pct", header: "Chg 1D%", align: "right" as const },
  { key: "implied_vol_pct", header: "Impl Vol%", align: "right" as const },
  { key: "market_status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, ticker: "AAPL", last_price: "182.50", bid: "182.45", ask: "182.55", vwap_price: "182.25", last_volume: "54.2M", listed_shares: "1,000,000", chg_1d_pct: "+0.5%", implied_vol_pct: "25.0%", market_status: "Open" },
  { id: 2, ticker: "MSFT", last_price: "415.30", bid: "415.25", ask: "415.35", vwap_price: "415.10", last_volume: "32.1M", listed_shares: "1,000,000", chg_1d_pct: "+1.2%", implied_vol_pct: "22.5%", market_status: "Open" },
  { id: 3, ticker: "GOOGL", last_price: "142.80", bid: "142.75", ask: "142.85", vwap_price: "142.60", last_volume: "28.4M", listed_shares: "1,000,000", chg_1d_pct: "-0.3%", implied_vol_pct: "28.0%", market_status: "Open" },
  { id: 4, ticker: "AMZN", last_price: "178.90", bid: "178.85", ask: "178.95", vwap_price: "178.70", last_volume: "41.8M", listed_shares: "1,000,000", chg_1d_pct: "+0.8%", implied_vol_pct: "30.0%", market_status: "Open" },
  { id: 5, ticker: "TSLA", last_price: "245.60", bid: "245.50", ask: "245.70", vwap_price: "245.30", last_volume: "98.2M", listed_shares: "1,000,000", chg_1d_pct: "-2.1%", implied_vol_pct: "45.0%", market_status: "Open" },
  { id: 6, ticker: "NVDA", last_price: "875.40", bid: "875.30", ask: "875.50", vwap_price: "874.90", last_volume: "45.6M", listed_shares: "1,000,000", chg_1d_pct: "+3.5%", implied_vol_pct: "35.0%", market_status: "Open" },
];

export default function MarketDataPage() {
  return <DataTable columns={columns} data={mockData} />;
}
