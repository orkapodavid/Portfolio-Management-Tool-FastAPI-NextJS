"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "notional", header: "Notional", align: "right" as const },
  { key: "current_value", header: "Current Value", align: "right" as const },
  { key: "excess", header: "Excess", align: "right" as const },
];

const mockData = [
  { id: 1, ticker: "9984.T CB", company_name: "SoftBank Group", notional: "$5,500,000", current_value: "$6,200,000", excess: "+$700,000" },
  { id: 2, ticker: "HSBA.L CB", company_name: "HSBC Holdings", notional: "$7,500,000", current_value: "$7,100,000", excess: "-$400,000" },
];

export default function ExcessAmountPage() {
  return <DataTable columns={columns} data={mockData} />;
}
