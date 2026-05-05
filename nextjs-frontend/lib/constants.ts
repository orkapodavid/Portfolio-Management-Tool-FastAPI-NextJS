// PMT Design System Constants

export const COLORS = {
  NAV_BG: "#333333",
  NAV_TEXT: "#cdd6f4",
  SIDEBAR_BG: "#F9F9F9",
  POSITIVE_GREEN: "#00A651",
  NEGATIVE_RED: "#C00000",
  ALERT_AMBER: "#FFC000",
  BORDER_GREY: "#CCCCCC",
  ROW_HIGHLIGHT: "#FFF2CC",
  FINANCIAL_GREY: "#F0F0F0",
  SURFACE: "#1e1e2e",
  SURFACE_ALT: "#181825",
} as const;

export const LAYOUT = {
  NAV_HEIGHT: "40px",
  KPI_HEIGHT: "28px",
  CONTROL_BAR_HEIGHT: "36px",
  SUBTAB_HEIGHT: "28px",
  TABLE_ROW_HEIGHT: "28px",
  ICON_NAV_SIZE: 14,
  ICON_KPI_SIZE: 8,
} as const;

export const MODULES = [
  {
    id: "market-data",
    label: "Market Data",
    icon: "BarChart2",
    subtabs: [
      { id: "market-data", label: "Market Data" },
      { id: "fx-data", label: "FX Data" },
      { id: "historical-data", label: "Historical Data" },
      { id: "trading-calendar", label: "Trading Calendar" },
      { id: "market-hours", label: "Market Hours" },
      { id: "ticker-data", label: "Ticker Data" },
    ],
  },
  {
    id: "positions",
    label: "Positions",
    icon: "Briefcase",
    subtabs: [
      { id: "positions", label: "Positions" },
      { id: "stock-position", label: "Stock Position" },
      { id: "warrant-position", label: "Warrant Position" },
      { id: "bond-positions", label: "Bond Positions" },
      { id: "trade-summary", label: "Trade Summary" },
    ],
  },
  {
    id: "pnl",
    label: "P&L",
    icon: "DollarSign",
    subtabs: [
      { id: "pnl-change", label: "P&L Change" },
      { id: "pnl-summary", label: "P&L Summary" },
      { id: "pnl-currency", label: "P&L Currency" },
      { id: "pnl-full", label: "P&L Full" },
    ],
  },
  {
    id: "risk",
    label: "Risk",
    icon: "ShieldAlert",
    subtabs: [
      { id: "delta-change", label: "Delta Change" },
      { id: "risk-measures", label: "Risk Measures" },
      { id: "risk-inputs", label: "Risk Inputs" },
    ],
  },
  {
    id: "recon",
    label: "Recon",
    icon: "FileCheck2",
    subtabs: [
      { id: "pps-recon", label: "PPS Recon" },
      { id: "settlement-recon", label: "Settlement Recon" },
      { id: "failed-trades", label: "Failed Trades" },
      { id: "pnl-recon", label: "P&L Recon" },
      { id: "risk-input-recon", label: "Risk Input Recon" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: "Scale",
    subtabs: [
      { id: "restricted-list", label: "Restricted List" },
      { id: "undertakings", label: "Undertakings" },
      { id: "beneficial-ownership", label: "Beneficial Ownership" },
    ],
  },
  {
    id: "portfolio-tools",
    label: "Portfolio Tools",
    icon: "Wrench",
    subtabs: [
      { id: "pay-to-hold", label: "Pay to Hold" },
      { id: "stock-borrow", label: "Stock Borrow" },
      { id: "reset-dates", label: "Reset Dates" },
      { id: "coming-resets", label: "Coming Resets" },
      { id: "cb-installments", label: "CB Installments" },
      { id: "excess-amount", label: "Excess Amount" },
    ],
  },
  {
    id: "instruments",
    label: "Instruments",
    icon: "Layers",
    subtabs: [
      { id: "ticker-data", label: "Ticker Data" },
      { id: "stock-screener", label: "Stock Screener" },
      { id: "special-terms", label: "Special Terms" },
    ],
  },
  {
    id: "events",
    label: "Events",
    icon: "Calendar",
    subtabs: [
      { id: "event-calendar", label: "Event Calendar" },
      { id: "event-stream", label: "Event Stream" },
      { id: "reverse-inquiry", label: "Reverse Inquiry" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: "Settings",
    subtabs: [
      { id: "daily-procedures", label: "Daily Procedures" },
      { id: "operation-process", label: "Operation Process" },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    icon: "ShoppingCart",
    subtabs: [
      { id: "emsx-order", label: "EMSX Order" },
      { id: "emsx-route", label: "EMSX Route" },
    ],
  },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];
