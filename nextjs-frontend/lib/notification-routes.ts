import { MODULES } from "@/lib/constants";

type NotificationRouteInput = {
  module?: string | null;
  subtab?: string | null;
};

const MODULE_SLUG_OVERRIDES: Record<string, string> = {
  reconciliation: "recon",
  recon: "recon",
};

const GRID_ROW_ID_KEYS: Record<string, string> = {
  market_data_grid: "ticker",
  fx_data_grid: "ticker",
  historical_data_grid: "ticker",
  pnl_change_grid: "ticker",
  pnl_full_grid: "ticker",
  pnl_summary_grid: "underlying",
  pnl_currency_grid: "currency",
  positions_grid: "ticker",
  stock_position_grid: "id",
  warrant_position_grid: "id",
  bond_positions_grid: "id",
  trade_summary_grid: "id",
  delta_change_grid: "ticker",
  risk_measures_grid: "ticker",
  risk_inputs_grid: "seed",
  ticker_data_grid: "ticker",
  stock_screener_grid: "ticker",
  instrument_data_grid: "deal_num",
  instrument_term_grid: "id",
  special_term_grid: "id",
};

const slugifySegment = (value: string): string =>
  value
    .trim()
    .replace(/p\s*&\s*l/gi, "pnl")
    .replace(/·/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const moduleSlug = (value: string): string => {
  const slug = slugifySegment(value);
  return MODULE_SLUG_OVERRIDES[slug] ?? slug;
};

const resolveModule = (value: string) => {
  const slug = moduleSlug(value);
  return MODULES.find(
    (module) => module.id === slug || moduleSlug(module.label) === slug
  );
};

const resolveSubtab = (
  module: (typeof MODULES)[number] | undefined,
  value: string
) => {
  const slug = slugifySegment(value);
  return module?.subtabs.find(
    (subtab) => subtab.id === slug || slugifySegment(subtab.label) === slug
  );
};

export function slugifyNotificationRoute({
  module,
  subtab,
}: NotificationRouteInput): string {
  const moduleLabel = module?.trim() || "Market Data";
  const subtabLabel = subtab?.trim() || "Market Data";
  const resolvedModule = resolveModule(moduleLabel);
  const resolvedModuleSlug = resolvedModule?.id ?? moduleSlug(moduleLabel);
  const resolvedSubtab = resolveSubtab(resolvedModule, subtabLabel);
  const resolvedSubtabSlug =
    resolvedSubtab?.id ?? slugifySegment(subtabLabel);
  return `/dashboard/${resolvedModuleSlug}/${resolvedSubtabSlug}`;
}

export const getNotificationRowIdKey = (gridId: string): string =>
  GRID_ROW_ID_KEYS[gridId] ?? "id";
