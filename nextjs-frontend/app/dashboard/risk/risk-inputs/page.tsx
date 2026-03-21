"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "underlying", header: "Underlying" },
  { key: "ticker", header: "Ticker" },
  { key: "spot_price", header: "Spot", align: "right" as const },
  { key: "valuation_price", header: "Val Price", align: "right" as const },
  { key: "fx_rate", header: "FX Rate", align: "right" as const },
  { key: "currency", header: "CCY" },
  { key: "notional", header: "Notional", align: "right" as const },
];

const mockData = [
  { id: 1, underlying: "Toyota Motor", ticker: "7203.T", spot_price: "2,876.50", valuation_price: "2,870.00", fx_rate: "149.85", currency: "JPY", notional: "$12,500,000" },
  { id: 2, underlying: "Sony Group", ticker: "6758.T", spot_price: "14,234.00", valuation_price: "14,200.00", fx_rate: "149.85", currency: "JPY", notional: "$9,000,000" },
  { id: 3, underlying: "Apple Inc.", ticker: "AAPL", spot_price: "182.50", valuation_price: "182.00", fx_rate: "1.0000", currency: "USD", notional: "$4,600,000" },
  { id: 4, underlying: "NVIDIA Corp.", ticker: "NVDA", spot_price: "875.40", valuation_price: "874.00", fx_rate: "1.0000", currency: "USD", notional: "$13,200,000" },
];

export default function RiskInputsPage() {
  return <DataTable columns={columns} data={mockData} />;
}
