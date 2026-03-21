"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "underlying", header: "Underlying" },
  { key: "ticker", header: "Ticker" },
  { key: "delta", header: "Delta", align: "right" as const },
  { key: "gamma", header: "Gamma", align: "right" as const },
  { key: "vega", header: "Vega", align: "right" as const },
  { key: "theta", header: "Theta", align: "right" as const },
  { key: "pos_delta", header: "Pos Delta", align: "right" as const },
  { key: "pos_gamma", header: "Pos Gamma", align: "right" as const },
];

const mockData = [
  { id: 1, underlying: "Toyota Motor", ticker: "7203.T", delta: "1.00", gamma: "0.00", vega: "0.00", theta: "0.00", pos_delta: "+45,000", pos_gamma: "0" },
  { id: 2, underlying: "SoftBank WRT", ticker: "9984.T WRT", delta: "0.65", gamma: "0.012", vega: "125.50", theta: "-45.20", pos_delta: "+65,000", pos_gamma: "+1,200" },
  { id: 3, underlying: "Nintendo WRT", ticker: "7974.T WRT", delta: "0.45", gamma: "0.008", vega: "89.30", theta: "-32.10", pos_delta: "+22,500", pos_gamma: "+400" },
  { id: 4, underlying: "HSBC CB", ticker: "HSBA.L CB", delta: "0.72", gamma: "0.005", vega: "67.80", theta: "-18.50", pos_delta: "+7,200", pos_gamma: "+50" },
];

export default function RiskMeasuresPage() {
  return <DataTable columns={columns} data={mockData} />;
}
