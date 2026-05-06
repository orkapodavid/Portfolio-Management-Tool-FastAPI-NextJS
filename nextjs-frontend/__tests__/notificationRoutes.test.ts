import {
  getNotificationRowIdKey,
  slugifyNotificationRoute,
} from "@/lib/notification-routes";

describe("notification routes", () => {
  it.each([
    ["Market Data", "Market Data", "/dashboard/market-data/market-data"],
    ["Positions", "Positions", "/dashboard/positions/positions"],
    ["PnL", "PnL Change", "/dashboard/pnl/pnl-change"],
    ["Risk", "Delta Change", "/dashboard/risk/delta-change"],
    ["Reconciliation", "Failed Trades", "/dashboard/recon/failed-trades"],
    ["Compliance", "Beneficial Ownership", "/dashboard/compliance/beneficial-ownership"],
    ["Portfolio Tools", "Pay to Hold", "/dashboard/portfolio-tools/pay-to-hold"],
    ["Instruments", "Instrument Data", "/dashboard/instruments/instrument-data"],
    ["Events", "Event Calendar", "/dashboard/events/event-calendar"],
    ["Operations", "Daily Procedures", "/dashboard/operations/daily-procedures"],
    ["Orders", "EMSX Order", "/dashboard/orders/emsx-order"],
  ])("maps %s / %s to %s", (module, subtab, expected) => {
    expect(slugifyNotificationRoute({ module, subtab })).toBe(expected);
  });

  it.each([
    ["P&L", "P&L Summary", "/dashboard/pnl/pnl-summary"],
    ["Recon", "PPS Recon", "/dashboard/recon/pps-recon"],
    ["Portfolio Tools", "PO Settlement", "/dashboard/portfolio-tools/po-settlement"],
  ])("handles special labels %s / %s", (module, subtab, expected) => {
    expect(slugifyNotificationRoute({ module, subtab })).toBe(expected);
  });

  it("returns Reflex-compatible row id keys for notification targets", () => {
    expect(getNotificationRowIdKey("pnl_change_grid")).toBe("ticker");
    expect(getNotificationRowIdKey("pnl_currency_grid")).toBe("currency");
    expect(getNotificationRowIdKey("unknown_grid")).toBe("id");
  });
});
