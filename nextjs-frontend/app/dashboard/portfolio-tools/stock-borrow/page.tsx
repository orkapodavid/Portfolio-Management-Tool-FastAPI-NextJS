"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "borrow_qty", header: "Borrow Qty", align: "right" as const },
  { key: "rate", header: "Rate", align: "right" as const },
  { key: "start_date", header: "Start Date" },
  { key: "status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, ticker: "TSLA", company_name: "Tesla Inc.", borrow_qty: "10,000", rate: "0.50%", start_date: "2026-01-15", status: "Active" },
  { id: 2, ticker: "GME", company_name: "GameStop", borrow_qty: "5,000", rate: "12.50%", start_date: "2026-02-01", status: "Active" },
];

export default function StockBorrowPage() {
  return <DataTable columns={columns} data={mockData} />;
}
