type GridRow = Record<string, unknown>;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number) =>
  min + Math.random() * (max - min);

/**
 * Apply 1..numRows immutable updates to randomly selected rows. Mirrors the
 * Reflex `for _ in range(random.randint(1, min(numRows, len(rows))))` loop.
 */
const updateRandomRows = <TRow extends GridRow>(
  rows: TRow[],
  numRows: number,
  mutate: (row: TRow) => TRow,
): TRow[] => {
  if (rows.length === 0) return rows;
  const next = [...rows];
  const count = randomInt(1, Math.min(numRows, next.length));
  for (let i = 0; i < count; i += 1) {
    const idx = randomInt(0, next.length - 1);
    const original = next[idx];
    if (!original) continue;
    next[idx] = mutate(original);
  }
  return next;
};

/**
 * Format `YYYY-MM-DD HH:MM:SS` like Reflex's
 * `datetime.now().strftime("%Y-%m-%d %H:%M:%S")`.
 */
const formatNowYmdHms = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
};

/**
 * Reflex parity port of
 * `EventCalendarMixin.simulate_event_calendar_update` — jitters the `time`
 * field (formatted `H:MM AM/PM`) by ±5 minutes on 1-3 random rows.
 */
export const eventCalendarSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  updateRandomRows(rows, 3, (row) => {
    const next = { ...row } as TRow;
    const time = next["time"];
    if (typeof time !== "string" || time === "") return next;
    const parts = time.split(":");
    if (parts.length < 2) return next;
    const hour = Number(parts[0]);
    const minutePart = parts[1].replace(/ AM/g, "").replace(/ PM/g, "");
    const minute = Number(minutePart);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return next;
    const adjusted = ((minute + randomInt(-5, 5)) % 60 + 60) % 60;
    const ampm = hour < 12 ? "AM" : "PM";
    let displayHour = hour <= 12 ? hour : hour - 12;
    if (displayHour === 0) displayHour = 12;
    (next as Record<string, unknown>)["time"] =
      `${displayHour}:${String(adjusted).padStart(2, "0")} ${ampm}`;
    return next;
  });

/**
 * Reflex parity port of `EventStreamMixin.simulate_event_stream_update` —
 * stamps `updated_time` to the current `YYYY-MM-DD HH:MM:SS` on 1-3 random
 * rows. No other field values change.
 */
export const eventStreamSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  updateRandomRows(rows, 3, (row) => {
    const next = { ...row } as TRow;
    (next as Record<string, unknown>)["updated_time"] = formatNowYmdHms();
    return next;
  });

/**
 * Reflex parity port of
 * `ReverseInquiryMixin.simulate_reverse_inquiry_update` — jitters
 * `deal_point` (formatted `123 bps`) ±2% on 1-3 random rows. The numeric
 * portion is rendered with no decimals to match Python's `f"{val:.0f} bps"`.
 */
export const reverseInquirySimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] =>
  updateRandomRows(rows, 3, (row) => {
    const next = { ...row } as TRow;
    const dp = next["deal_point"];
    if (typeof dp !== "string" || dp === "") return next;
    const cleaned = dp.replace(/bps/g, "").replace(/,/g, "").trim();
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return next;
    const value = parsed * randomFloat(0.98, 1.02);
    (next as Record<string, unknown>)["deal_point"] =
      `${Math.round(value)} bps`;
    return next;
  });
