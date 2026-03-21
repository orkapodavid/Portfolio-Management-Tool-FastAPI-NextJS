"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "underlying", header: "Underlying" },
  { key: "currency", header: "CCY" },
  { key: "price", header: "Price", align: "right" as const },
  { key: "price_t_1", header: "Prev Close", align: "right" as const },
  { key: "price_change", header: "Chg%", align: "right" as const },
  { key: "fx_rate", header: "FX Rate", align: "right" as const },
  { key: "last_volume", header: "Volume", align: "right" as const },
];

const mockData = [
  { id: 1, underlying: "Toyota Motor", currency: "JPY", price: "2,876.50", price_t_1: "2,845.00", price_change: "+1.11%", fx_rate: "149.8500", last_volume: "5,234,567" },
  { id: 2, underlying: "Sony Group", currency: "JPY", price: "14,234.00", price_t_1: "14,123.00", price_change: "+0.79%", fx_rate: "149.8500", last_volume: "2,345,678" },
  { id: 3, underlying: "Nintendo", currency: "JPY", price: "8,567.00", price_t_1: "8,456.00", price_change: "+1.31%", fx_rate: "149.8500", last_volume: "3,456,789" },
  { id: 4, underlying: "SoftBank Group", currency: "JPY", price: "9,123.00", price_t_1: "9,345.00", price_change: "-2.37%", fx_rate: "149.8500", last_volume: "6,789,012" },
  { id: 5, underlying: "ASML Holdings", currency: "EUR", price: "678.90", price_t_1: "672.50", price_change: "+0.95%", fx_rate: "0.9234", last_volume: "1,234,567" },
];

export default function PnLSummaryPage() {
  return <DataTable columns={columns} data={mockData} />;
}
