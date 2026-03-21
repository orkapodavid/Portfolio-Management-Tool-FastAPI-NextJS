"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "position", header: "Position", align: "right" as const },
  { key: "daily_cost", header: "Daily Cost", align: "right" as const },
  { key: "mtd_cost", header: "MTD Cost", align: "right" as const },
  { key: "ytd_cost", header: "YTD Cost", align: "right" as const },
];

const mockData = [
  { id: 1, ticker: "7203.T", company_name: "Toyota Motor", position: "50,000", daily_cost: "-$1,250", mtd_cost: "-$26,250", ytd_cost: "-$87,500" },
  { id: 2, ticker: "AAPL", company_name: "Apple Inc.", position: "25,000", daily_cost: "-$625", mtd_cost: "-$13,125", ytd_cost: "-$43,750" },
];

export default function PayToHoldPage() {
  return <DataTable columns={columns} data={mockData} />;
}
