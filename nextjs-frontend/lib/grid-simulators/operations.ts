type GridRow = Record<string, unknown>;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const formatTimestamp = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

/**
 * Reflex parity port of `DailyProceduresMixin.simulate_daily_procedures_update`.
 *
 * Cycles `status` forward in the chain
 * `Pending` → `Running` → `Completed` → `Failed`, but only with ~30%
 * probability and only when the current status is not in the last two
 * positions (matching the upstream `current_idx < len(statuses) - 2`
 * guard which restricts advancement to `Pending` / `Running`).
 *
 * Mutates 1..min(3, len) random rows in place.
 */
export const dailyProceduresSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] => {
  if (rows.length === 0) return rows;

  const statuses = ["Pending", "Running", "Completed", "Failed"] as const;
  const next = [...rows];
  const updates = randomInt(1, Math.min(3, next.length));
  for (let i = 0; i < updates; i += 1) {
    const idx = randomInt(0, next.length - 1);
    const original = next[idx];
    if (!original) continue;
    const updated = { ...original } as TRow;
    if ("status" in updated) {
      const current = updated.status;
      if (typeof current === "string") {
        const currentIdx = statuses.indexOf(current as (typeof statuses)[number]);
        if (currentIdx >= 0 && currentIdx < statuses.length - 2) {
          if (Math.random() > 0.7) {
            (updated as Record<string, unknown>).status =
              statuses[currentIdx + 1];
          }
        }
      }
    }
    next[idx] = updated;
  }
  return next;
};

/**
 * Reflex parity port of
 * `OperationProcessesMixin.simulate_operation_processes_update`.
 *
 * On 1..min(3, len) random rows:
 *  - With ~20% probability, randomly reassigns `status` to one of
 *    `Idle`, `Running`, `Completed`, `Error`.
 *  - Always refreshes `last_run_time` to the current timestamp
 *    (formatted `YYYY-MM-DD HH:MM:SS`).
 */
export const operationProcessSimulator = <TRow extends GridRow>(
  rows: TRow[],
): TRow[] => {
  if (rows.length === 0) return rows;

  const statuses = ["Idle", "Running", "Completed", "Error"] as const;
  const next = [...rows];
  const updates = randomInt(1, Math.min(3, next.length));
  const now = formatTimestamp(new Date());
  for (let i = 0; i < updates; i += 1) {
    const idx = randomInt(0, next.length - 1);
    const original = next[idx];
    if (!original) continue;
    const updated = { ...original } as TRow;
    if ("status" in updated && Math.random() > 0.8) {
      (updated as Record<string, unknown>).status =
        statuses[randomInt(0, statuses.length - 1)];
    }
    if ("last_run_time" in updated) {
      (updated as Record<string, unknown>).last_run_time = now;
    }
    next[idx] = updated;
  }
  return next;
};
