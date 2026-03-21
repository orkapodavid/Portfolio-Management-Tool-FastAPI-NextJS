"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "compliance_type", header: "Type" },
  { key: "firm_block", header: "Firm Block" },
  { key: "compliance_start", header: "Start Date" },
  { key: "nda_end", header: "NDA End" },
  { key: "in_emsx", header: "EMSX", align: "center" as const },
];

const mockData = [
  { id: 1, ticker: "ABC.T", company_name: "ABC Corp", compliance_type: "Restricted", firm_block: "Yes", compliance_start: "2026-01-15", nda_end: "2026-06-30", in_emsx: "Blocked" },
  { id: 2, ticker: "XYZ.HK", company_name: "XYZ Holdings", compliance_type: "MNPI", firm_block: "No", compliance_start: "2026-02-01", nda_end: "2026-04-30", in_emsx: "Active" },
  { id: 3, ticker: "DEF.L", company_name: "DEF Industries", compliance_type: "Wall Cross", firm_block: "Yes", compliance_start: "2026-03-01", nda_end: "-", in_emsx: "Blocked" },
];

export default function RestrictedListPage() {
  return <DataTable columns={columns} data={mockData} />;
}
