"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "date", header: "Date" },
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "broker", header: "Broker" },
  { key: "direction", header: "Direction" },
  { key: "size", header: "Size", align: "right" as const },
  { key: "status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, date: "2026-03-21", ticker: "ABC.T", company_name: "ABC Corp", broker: "MS", direction: "Buy", size: "$5,000,000", status: "Open" },
  { id: 2, date: "2026-03-20", ticker: "XYZ.HK", company_name: "XYZ Holdings", broker: "GS", direction: "Sell", size: "$3,200,000", status: "Closed" },
];

export default function ReverseInquiryPage() {
  return <DataTable columns={columns} data={mockData} />;
}
