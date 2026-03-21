"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "term_type", header: "Term Type" },
  { key: "description", header: "Description" },
  { key: "effective_date", header: "Effective Date" },
  { key: "expiry_date", header: "Expiry Date" },
];

const mockData = [
  { id: 1, ticker: "9984.T CB", company_name: "SoftBank Group", term_type: "Put Option", description: "Holder put at 100%", effective_date: "2026-06-01", expiry_date: "2028-06-01" },
  { id: 2, ticker: "HSBA.L CB", company_name: "HSBC Holdings", term_type: "Conversion", description: "Conversion at 120% of initial price", effective_date: "2026-01-01", expiry_date: "2029-12-31" },
];

export default function SpecialTermsPage() {
  return <DataTable columns={columns} data={mockData} />;
}
