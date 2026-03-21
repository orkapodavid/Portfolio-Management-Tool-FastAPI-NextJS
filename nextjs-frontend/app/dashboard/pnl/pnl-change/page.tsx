"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "underlying", header: "Underlying" },
  { key: "ticker", header: "Ticker" },
  { key: "pnl_ytd", header: "YTD P&L", align: "right" as const },
  { key: "pnl_chg_1d", header: "1D Chg", align: "right" as const },
  { key: "pnl_chg_1w", header: "1W Chg", align: "right" as const },
  { key: "pnl_chg_1m", header: "1M Chg", align: "right" as const },
  { key: "pnl_chg_pct_1d", header: "1D%", align: "right" as const },
  { key: "pnl_chg_pct_1w", header: "1W%", align: "right" as const },
  { key: "pnl_chg_pct_1m", header: "1M%", align: "right" as const },
];

const mockData = [
  { id: 1, underlying: "Toyota Motor", ticker: "7203.T", pnl_ytd: "$1,234,567", pnl_chg_1d: "+$12,345", pnl_chg_1w: "+$45,678", pnl_chg_1m: "+$123,456", pnl_chg_pct_1d: "+1.2%", pnl_chg_pct_1w: "+3.5%", pnl_chg_pct_1m: "+8.7%" },
  { id: 2, underlying: "Sony Group", ticker: "6758.T", pnl_ytd: "$987,654", pnl_chg_1d: "-$8,765", pnl_chg_1w: "+$23,456", pnl_chg_1m: "+$67,890", pnl_chg_pct_1d: "-0.9%", pnl_chg_pct_1w: "+2.1%", pnl_chg_pct_1m: "+5.4%" },
  { id: 3, underlying: "Nintendo", ticker: "7974.T", pnl_ytd: "$2,345,678", pnl_chg_1d: "+$34,567", pnl_chg_1w: "+$78,901", pnl_chg_1m: "+$234,567", pnl_chg_pct_1d: "+2.3%", pnl_chg_pct_1w: "+4.8%", pnl_chg_pct_1m: "+12.1%" },
  { id: 4, underlying: "SoftBank Group", ticker: "9984.T", pnl_ytd: "($456,789)", pnl_chg_1d: "-$45,678", pnl_chg_1w: "-$89,012", pnl_chg_1m: "($156,789)", pnl_chg_pct_1d: "-3.2%", pnl_chg_pct_1w: "-5.6%", pnl_chg_pct_1m: "-9.8%" },
  { id: 5, underlying: "Keyence", ticker: "6861.T", pnl_ytd: "$3,456,789", pnl_chg_1d: "+$56,789", pnl_chg_1w: "+$123,456", pnl_chg_1m: "+$345,678", pnl_chg_pct_1d: "+1.8%", pnl_chg_pct_1w: "+5.2%", pnl_chg_pct_1m: "+15.3%" },
];

export default function PnLChangePage() {
  return <DataTable columns={columns} data={mockData} />;
}
