"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "currency", header: "CCY" },
  { key: "fx_rate", header: "FX Rate", align: "right" as const },
  { key: "fx_rate_change", header: "FX Chg%", align: "right" as const },
  { key: "ccy_exposure", header: "CCY Exposure", align: "right" as const },
  { key: "usd_exposure", header: "USD Exposure", align: "right" as const },
  { key: "ccy_hedged_pnl", header: "Hedged P&L", align: "right" as const },
  { key: "pos_ccy_pnl", header: "Pos CCY P&L", align: "right" as const },
];

const mockData = [
  { id: 1, currency: "USD", fx_rate: "1.0000", fx_rate_change: "0.00%", ccy_exposure: "$45,678,901", usd_exposure: "$45,678,901", ccy_hedged_pnl: "$123,456", pos_ccy_pnl: "$123,456" },
  { id: 2, currency: "JPY", fx_rate: "149.8500", fx_rate_change: "+0.42%", ccy_exposure: "\u00a512,345,000,000", usd_exposure: "$82,456,789", ccy_hedged_pnl: "\u00a5234,567,890", pos_ccy_pnl: "$1,567,890" },
  { id: 3, currency: "EUR", fx_rate: "0.9234", fx_rate_change: "+0.49%", ccy_exposure: "\u20ac23,456,789", usd_exposure: "$25,402,345", ccy_hedged_pnl: "\u20ac345,678", pos_ccy_pnl: "$374,567" },
  { id: 4, currency: "GBP", fx_rate: "0.7923", fx_rate_change: "+0.41%", ccy_exposure: "\u00a38,901,234", usd_exposure: "$11,234,567", ccy_hedged_pnl: "\u00a389,012", pos_ccy_pnl: "$112,345" },
  { id: 5, currency: "HKD", fx_rate: "7.8145", fx_rate_change: "+0.06%", ccy_exposure: "HK$156,789,012", usd_exposure: "$20,067,890", ccy_hedged_pnl: "HK$1,234,567", pos_ccy_pnl: "$158,012" },
];

export default function PnLCurrencyPage() {
  return <DataTable columns={columns} data={mockData} />;
}
