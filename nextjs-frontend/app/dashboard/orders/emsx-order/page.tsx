"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "sequence", header: "Seq#" },
  { key: "ticker", header: "Ticker" },
  { key: "underlying", header: "Underlying" },
  { key: "side", header: "Side" },
  { key: "status", header: "Status", align: "center" as const },
  { key: "order_amount", header: "Order Amt", align: "right" as const },
  { key: "filled_amount", header: "Filled Amt", align: "right" as const },
  { key: "limit_price", header: "Limit", align: "right" as const },
  { key: "avg_fill_price", header: "Avg Fill", align: "right" as const },
  { key: "broker", header: "Broker" },
];

const mockData = [
  { id: 1, sequence: "001", ticker: "7203.T", underlying: "Toyota Motor", side: "Buy", status: "Working", order_amount: "10,000", filled_amount: "5,000", limit_price: "2,880.00", avg_fill_price: "2,876.50", broker: "MS" },
  { id: 2, sequence: "002", ticker: "AAPL", underlying: "Apple Inc.", side: "Sell", status: "Filled", order_amount: "5,000", filled_amount: "5,000", limit_price: "182.00", avg_fill_price: "182.35", broker: "GS" },
  { id: 3, sequence: "003", ticker: "NVDA", underlying: "NVIDIA Corp.", side: "Buy", status: "Partially Filled", order_amount: "3,000", filled_amount: "1,500", limit_price: "875.00", avg_fill_price: "875.20", broker: "JPM" },
  { id: 4, sequence: "004", ticker: "9984.T", underlying: "SoftBank Group", side: "Sell", status: "New", order_amount: "20,000", filled_amount: "0", limit_price: "9,150.00", avg_fill_price: "-", broker: "MS" },
];

export default function EMSXOrderPage() {
  return <DataTable columns={columns} data={mockData} />;
}
