"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "installment_date", header: "Install Date" },
  { key: "amount", header: "Amount", align: "right" as const },
  { key: "status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, ticker: "9984.T CB", company_name: "SoftBank Group", installment_date: "2026-04-01", amount: "$1,100,000", status: "Upcoming" },
  { id: 2, ticker: "HSBA.L CB", company_name: "HSBC Holdings", installment_date: "2026-07-01", amount: "$1,500,000", status: "Scheduled" },
];

export default function CBInstallmentsPage() {
  return <DataTable columns={columns} data={mockData} />;
}
