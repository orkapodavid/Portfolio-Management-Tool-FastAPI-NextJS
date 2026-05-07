"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getKpiData,
  getPortfolioHoldings,
  getTopMovers,
} from "@/app/clientService";
import { getAuthToken } from "@/lib/auth/token-storage";
import { COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getApiData, getApiError } from "@/lib/utils";

type KPIMetric = {
  label: string;
  value: string;
  is_positive: boolean;
  trend_data: string;
};

type Holding = {
  symbol: string;
  shares: number;
  avg_cost: number;
  current_price: number;
  daily_change_pct: number;
};

type TopMover = {
  ticker: string;
  name?: string;
  value: string;
  change: string;
  is_positive: boolean;
};

type MoverCategory = "ops" | "ytd" | "delta" | "price" | "volume";

const MOVER_CATEGORIES: { key: MoverCategory; title: string }[] = [
  { key: "ops", title: "Ops PnL" },
  { key: "ytd", title: "YTD PnL" },
  { key: "delta", title: "Delta Leaders" },
  { key: "price", title: "Price Movers" },
  { key: "volume", title: "Volume Leaders" },
];

function KpiCard({ metric }: { metric: KPIMetric }) {
  const accent = metric.is_positive
    ? `border-[${COLORS.POSITIVE_GREEN}]`
    : `border-[${COLORS.NEGATIVE_RED}]`;
  const text = metric.is_positive
    ? `text-[${COLORS.POSITIVE_GREEN}]`
    : `text-[${COLORS.NEGATIVE_RED}]`;
  const stroke = metric.is_positive
    ? COLORS.POSITIVE_GREEN
    : COLORS.NEGATIVE_RED;
  return (
    <div
      className={cn(
        "flex items-center bg-white px-2 h-[28px] shadow-sm border-l-[3px] border-y border-r border-gray-200 min-w-[155px] flex-1 hover:bg-gray-50 transition-colors",
        accent,
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <span className="text-[7px] font-black text-gray-400 uppercase tracking-[0.15em] truncate">
            {metric.label}
          </span>
          <span className={cn("text-[10px] font-black tracking-tighter", text)}>
            {metric.value}
          </span>
        </div>
        <svg
          viewBox="0 0 50 24"
          className="w-8 h-4 opacity-40 shrink-0 ml-auto"
        >
          <polyline
            points={metric.trend_data}
            stroke={stroke}
            fill="none"
            strokeWidth={2}
          />
        </svg>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  trend,
  isPositive,
}: {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
}) {
  const accent = isPositive
    ? "border-l-[3px] border-[#00AA00]"
    : "border-l-[3px] border-[#DD0000]";
  const trendColor = isPositive ? "text-[#00AA00]" : "text-[#DD0000]";
  return (
    <div
      className={cn(
        "bg-white shadow-sm px-2 py-0 border-y border-r border-gray-200 flex items-center min-w-[160px] h-[28px] hover:bg-gray-50 transition-colors",
        accent,
      )}
    >
      <div className="flex flex-row items-center justify-between w-full">
        <span className="text-[7px] font-black text-gray-400 uppercase tracking-[0.1em] truncate mr-2">
          {title}
        </span>
        <div className="flex items-center">
          <span className="text-[10px] font-black text-gray-800 tracking-tighter">
            {value}
          </span>
          <span className={cn("text-[8px] font-black ml-1.5", trendColor)}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}

function MoverRow({ item }: { item: TopMover }) {
  const changeColor = item.is_positive
    ? `text-[${COLORS.POSITIVE_GREEN}]`
    : `text-[${COLORS.NEGATIVE_RED}]`;
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-100 transition-colors h-[22px]">
      <td className="py-0 pl-2 font-black text-gray-900 truncate text-[8px]">
        {item.ticker}
      </td>
      <td className="py-0 font-bold text-gray-700 text-right truncate text-[8px]">
        {item.value}
      </td>
      <td
        className={cn(
          "py-0 pr-2 font-black text-right truncate text-[8px]",
          changeColor,
        )}
      >
        {item.change}
      </td>
    </tr>
  );
}

function MiniGrid({ title, data }: { title: string; data: TopMover[] }) {
  return (
    <div className="bg-white border border-gray-200 overflow-hidden w-full shadow-sm rounded-sm">
      <h4 className="text-[8px] font-black text-[#333333] px-2 py-0.5 border-b border-gray-200 uppercase tracking-widest bg-gray-100/50">
        {title}
      </h4>
      <table className="w-full table-fixed">
        <tbody>
          {data.map((item, i) => (
            <MoverRow key={`${item.ticker}-${i}`} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const formatCurrency = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatPercent = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export function PerformanceHeader() {
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [movers, setMovers] = useState<Record<MoverCategory, TopMover[]>>({
    ops: [],
    ytd: [],
    delta: [],
    price: [],
    volume: [],
  });
  const [showTopMovers, setShowTopMovers] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const auth = { headers: { Authorization: `Bearer ${token}` } };

    void Promise.all([
      getKpiData(auth),
      getPortfolioHoldings(auth),
      ...MOVER_CATEGORIES.map(({ key }) =>
        getTopMovers({ ...auth, query: { category: key } }),
      ),
    ]).then((responses) => {
      const [kpiResp, holdingsResp, ...moverResps] = responses;

      if (!getApiError(kpiResp)) {
        setKpiMetrics((getApiData(kpiResp) as KPIMetric[]) ?? []);
      }
      if (!getApiError(holdingsResp)) {
        setHoldings((getApiData(holdingsResp) as Holding[]) ?? []);
      }

      const collected: Record<MoverCategory, TopMover[]> = {
        ops: [],
        ytd: [],
        delta: [],
        price: [],
        volume: [],
      };
      moverResps.forEach((resp, idx) => {
        if (getApiError(resp)) return;
        collected[MOVER_CATEGORIES[idx].key] =
          (getApiData(resp) as TopMover[]) ?? [];
      });
      setMovers(collected);
    });
  }, []);

  const totalValue = holdings.reduce(
    (sum, h) => sum + h.shares * h.current_price,
    0,
  );
  const totalCostBasis = holdings.reduce(
    (sum, h) => sum + h.shares * h.avg_cost,
    0,
  );
  const totalGainLoss = totalValue - totalCostBasis;
  const totalGainLossPct =
    totalCostBasis === 0 ? 0 : (totalGainLoss / totalCostBasis) * 100;
  const dailyChangeValue = holdings.reduce(
    (sum, h) => sum + h.shares * h.current_price * (h.daily_change_pct / 100),
    0,
  );
  const dailyChangePct =
    totalValue === 0 ? 0 : (dailyChangeValue / totalValue) * 100;

  return (
    <section
      className="shrink-0 shadow-sm border-b border-gray-300 z-50"
      style={{ backgroundColor: COLORS.FINANCIAL_GREY }}
    >
      <div className="flex flex-col w-full items-start justify-between">
        <div className="flex items-center gap-2 w-full px-2 py-0">
          <div className="flex flex-wrap md:flex-nowrap gap-0 overflow-visible flex-1">
            {kpiMetrics.map((metric) => (
              <KpiCard key={metric.label} metric={metric} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <SummaryCard
              title="Total Value"
              value={formatCurrency(totalValue)}
              trend={formatPercent(totalGainLossPct)}
              isPositive={totalGainLoss >= 0}
            />
            <SummaryCard
              title="Daily Change"
              value={formatCurrency(dailyChangeValue)}
              trend={formatPercent(dailyChangePct)}
              isPositive={dailyChangeValue >= 0}
            />
            <SummaryCard
              title="Total G/L"
              value={formatCurrency(totalGainLoss)}
              trend={formatPercent(totalGainLossPct)}
              isPositive={totalGainLoss >= 0}
            />
          </div>
        </div>
        <div className="w-full">
          <button
            type="button"
            onClick={() => setShowTopMovers((prev) => !prev)}
            className="w-full flex items-center justify-center py-0 bg-gray-100 border-y border-gray-200 hover:bg-gray-200 transition-colors h-[12px]"
          >
            <div className="flex items-center gap-1 text-gray-500">
              <span className="text-[6px] font-black uppercase tracking-[0.3em]">
                {showTopMovers ? "Hide Top Movers" : "Show Top Movers"}
              </span>
              {showTopMovers ? (
                <ChevronUp size={8} />
              ) : (
                <ChevronDown size={8} />
              )}
            </div>
          </button>
          {showTopMovers && (
            <div className="block w-full bg-white border-b border-gray-300 shadow-inner overflow-hidden md:h-[200px] overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-1 w-full p-1 bg-gray-100/30 overflow-x-auto">
                {MOVER_CATEGORIES.map(({ key, title }) => (
                  <MiniGrid key={key} title={title} data={movers[key]} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
