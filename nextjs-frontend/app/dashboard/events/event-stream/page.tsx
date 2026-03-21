"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "time", header: "Time" },
  { key: "ticker", header: "Ticker" },
  { key: "headline", header: "Headline" },
  { key: "source", header: "Source" },
  { key: "sentiment", header: "Sentiment", align: "center" as const },
];

const mockData = [
  { id: 1, time: "14:35", ticker: "NVDA", headline: "NVIDIA reports record datacenter revenue", source: "Bloomberg", sentiment: "Positive" },
  { id: 2, time: "13:20", ticker: "TSLA", headline: "Tesla deliveries miss Q1 estimates", source: "Reuters", sentiment: "Negative" },
  { id: 3, time: "11:45", ticker: "AAPL", headline: "Apple announces new AI chip for iPhones", source: "CNBC", sentiment: "Positive" },
  { id: 4, time: "10:15", ticker: "7203.T", headline: "Toyota to invest $10B in EV battery plant", source: "Nikkei", sentiment: "Positive" },
];

export default function EventStreamPage() {
  return <DataTable columns={columns} data={mockData} />;
}
