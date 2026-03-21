"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "underlying", header: "Underlying" },
  { key: "ticker", header: "Ticker" },
  { key: "sec_type", header: "Type" },
  { key: "currency", header: "CCY" },
  { key: "pos_delta", header: "Pos Delta", align: "right" as const },
  { key: "delta", header: "Delta", align: "right" as const },
  { key: "spot_price", header: "Spot", align: "right" as const },
  { key: "notional", header: "Notional", align: "right" as const },
];

const mockData = [
  { id: 1, underlying: "Toyota Motor", ticker: "7203.T", sec_type: "Equity", currency: "JPY", pos_delta: "+45,000", delta: "1.00", spot_price: "2,876.50", notional: "$12,500,000" },
  { id: 2, underlying: "Sony Group", ticker: "6758.T", sec_type: "Equity", currency: "JPY", pos_delta: "+28,500", delta: "1.00", spot_price: "14,234.00", notional: "$9,000,000" },
  { id: 3, underlying: "SoftBank Group", ticker: "9984.T WRT", sec_type: "Warrant", currency: "JPY", pos_delta: "+65,000", delta: "0.65", spot_price: "9,123.00", notional: "$5,500,000" },
  { id: 4, underlying: "Apple Inc.", ticker: "AAPL", sec_type: "Equity", currency: "USD", pos_delta: "+25,000", delta: "1.00", spot_price: "182.50", notional: "$4,600,000" },
  { id: 5, underlying: "NVIDIA Corp.", ticker: "NVDA", sec_type: "Equity", currency: "USD", pos_delta: "+15,000", delta: "1.00", spot_price: "875.40", notional: "$13,200,000" },
];

export default function DeltaChangePage() {
  return <DataTable columns={columns} data={mockData} />;
}
