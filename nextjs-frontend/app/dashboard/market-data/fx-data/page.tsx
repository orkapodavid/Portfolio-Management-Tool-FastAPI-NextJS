"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Pair" },
  { key: "last_price", header: "Rate", align: "right" as const },
  { key: "bid", header: "Bid", align: "right" as const },
  { key: "ask", header: "Ask", align: "right" as const },
  { key: "chg_1d_pct", header: "Chg 1D%", align: "right" as const },
];

const mockData = [
  { id: 1, ticker: "USDJPY", last_price: "149.8500", bid: "149.8400", ask: "149.8600", chg_1d_pct: "+0.42%" },
  { id: 2, ticker: "EURUSD", last_price: "1.0825", bid: "1.0823", ask: "1.0827", chg_1d_pct: "+0.15%" },
  { id: 3, ticker: "GBPUSD", last_price: "1.2650", bid: "1.2648", ask: "1.2652", chg_1d_pct: "-0.08%" },
  { id: 4, ticker: "USDCNY", last_price: "7.2450", bid: "7.2440", ask: "7.2460", chg_1d_pct: "+0.03%" },
  { id: 5, ticker: "AUDUSD", last_price: "0.6540", bid: "0.6538", ask: "0.6542", chg_1d_pct: "-0.22%" },
  { id: 6, ticker: "USDHKD", last_price: "7.8145", bid: "7.8140", ask: "7.8150", chg_1d_pct: "+0.01%" },
];

export default function FXDataPage() {
  return <DataTable columns={columns} data={mockData} />;
}
