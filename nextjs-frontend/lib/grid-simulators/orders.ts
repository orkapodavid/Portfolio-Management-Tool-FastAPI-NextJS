type GridRow = Record<string, unknown>;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const parseIntFromString = (raw: unknown): number | null => {
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.trunc(raw);
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/,/g, "").trim();
  if (cleaned === "") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

const withCommas = (n: number): string => n.toLocaleString("en-US");

/**
 * Reflex parity port of `EMSXOrderMixin.simulate_emsx_order_update`.
 *
 * Picks a single random order and bumps its `emsx_filled` value by
 * a random integer in `[100, 1000]`. The field is stored as a
 * comma-formatted string (e.g. `"12,345"`) so we parse → add →
 * re-format. If parsing fails the cell is reseeded with a random
 * value in `[1000, 5000]`.
 */
export const emsxOrderSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] => {
  if (rows.length === 0) return rows;

  const next = [...rows];
  const idx = randomInt(0, next.length - 1);
  const original = next[idx];
  if (!original) return next;
  const updated = { ...original } as TRow;
  const current = parseIntFromString(updated.emsx_filled ?? "0");
  let nextValue: number;
  if (current === null) {
    nextValue = randomInt(1000, 5000);
  } else {
    nextValue = current + randomInt(100, 1000);
  }
  (updated as Record<string, unknown>).emsx_filled = withCommas(nextValue);
  next[idx] = updated;
  return next;
};

/**
 * Reflex parity port of `EMSXRouteMixin.simulate_emsx_route_update`.
 *
 * Picks a single random route and bumps its `filled_quantity` by a
 * random integer in `[50, 500]`. Reflex stores this value as a raw
 * integer (no formatting), so we keep numeric typing on the way out.
 * If the existing value cannot be parsed, the cell is reseeded with a
 * random value in `[500, 3000]`.
 */
export const emsxRouteSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] => {
  if (rows.length === 0) return rows;

  const next = [...rows];
  const idx = randomInt(0, next.length - 1);
  const original = next[idx];
  if (!original) return next;
  const updated = { ...original } as TRow;
  const raw = updated.filled_quantity;
  const current = parseIntFromString(raw ?? 0);
  let nextValue: number;
  if (current === null) {
    nextValue = randomInt(500, 3000);
  } else {
    nextValue = current + randomInt(50, 500);
  }
  (updated as Record<string, unknown>).filled_quantity =
    typeof raw === "string" ? String(nextValue) : nextValue;
  next[idx] = updated;
  return next;
};
