"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "trade_date", header: "Date" },
  { key: "day_of_week", header: "Day" },
  { key: "usa", header: "USA", align: "center" as const },
  { key: "hkg", header: "HKG", align: "center" as const },
  { key: "jpn", header: "JPN", align: "center" as const },
  { key: "aus", header: "AUS", align: "center" as const },
  { key: "kor", header: "KOR", align: "center" as const },
  { key: "chn", header: "CHN", align: "center" as const },
  { key: "twn", header: "TWN", align: "center" as const },
  { key: "ind", header: "IND", align: "center" as const },
];

const mockData = [
  { id: 1, trade_date: "2026-03-23", day_of_week: "Monday", usa: "Open", hkg: "Open", jpn: "Open", aus: "Open", kor: "Open", chn: "Open", twn: "Open", ind: "Open" },
  { id: 2, trade_date: "2026-03-22", day_of_week: "Sunday", usa: "Closed", hkg: "Closed", jpn: "Closed", aus: "Closed", kor: "Closed", chn: "Closed", twn: "Closed", ind: "Closed" },
  { id: 3, trade_date: "2026-03-21", day_of_week: "Saturday", usa: "Closed", hkg: "Closed", jpn: "Closed", aus: "Closed", kor: "Closed", chn: "Closed", twn: "Closed", ind: "Closed" },
  { id: 4, trade_date: "2026-03-20", day_of_week: "Friday", usa: "Open", hkg: "Open", jpn: "Open", aus: "Open", kor: "Open", chn: "Open", twn: "Open", ind: "Open" },
  { id: 5, trade_date: "2026-03-19", day_of_week: "Thursday", usa: "Open", hkg: "Open", jpn: "Open", aus: "Open", kor: "Open", chn: "Open", twn: "Open", ind: "Open" },
];

export default function TradingCalendarPage() {
  return <DataTable columns={columns} data={mockData} />;
}
