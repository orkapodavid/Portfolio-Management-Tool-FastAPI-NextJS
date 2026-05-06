import {
  dailyProceduresSimulator,
  operationProcessSimulator,
} from "@/lib/grid-simulators/operations";

describe("operations simulators", () => {
  describe("dailyProceduresSimulator", () => {
    it("returns the same array when there are no rows", () => {
      const empty: { status?: string }[] = [];
      expect(dailyProceduresSimulator(empty)).toBe(empty);
    });

    it("returns a fresh array reference for non-empty input", () => {
      const rows = [
        { id: 1, status: "Pending" },
        { id: 2, status: "Running" },
        { id: 3, status: "Completed" },
      ];
      const next = dailyProceduresSimulator(rows);
      expect(next).not.toBe(rows);
      expect(next).toHaveLength(rows.length);
    });

    it("only ever advances status forward through the chain", () => {
      const chain = ["Pending", "Running", "Completed", "Failed"] as const;
      const rows = chain.map((status, i) => ({ id: i, status }));
      // Run many iterations and verify no cell ever moves backward.
      for (let i = 0; i < 50; i += 1) {
        const next = dailyProceduresSimulator(rows);
        for (let r = 0; r < rows.length; r += 1) {
          const before = chain.indexOf(rows[r].status);
          const after = chain.indexOf(
            (next[r] as { status: (typeof chain)[number] }).status,
          );
          expect(after).toBeGreaterThanOrEqual(before);
        }
      }
    });

    it("never advances rows already at Completed or Failed", () => {
      const rows = [
        { id: 1, status: "Completed" },
        { id: 2, status: "Failed" },
      ];
      for (let i = 0; i < 20; i += 1) {
        const next = dailyProceduresSimulator(rows);
        expect((next[0] as { status: string }).status).toBe("Completed");
        expect((next[1] as { status: string }).status).toBe("Failed");
      }
    });

    it("leaves rows without a status field untouched", () => {
      const rows = [{ id: 1, name: "no-status" }];
      const next = dailyProceduresSimulator(rows);
      expect(next[0]).toEqual(rows[0]);
    });
  });

  describe("operationProcessSimulator", () => {
    it("returns the same array when there are no rows", () => {
      const empty: { status?: string }[] = [];
      expect(operationProcessSimulator(empty)).toBe(empty);
    });

    it("always refreshes last_run_time on touched rows", () => {
      const rows = [
        { id: 1, status: "Idle", last_run_time: "1970-01-01 00:00:00" },
      ];
      const next = operationProcessSimulator(rows);
      const updated = next[0] as {
        status: string;
        last_run_time: string;
      };
      // Format must be YYYY-MM-DD HH:MM:SS and not the placeholder.
      expect(updated.last_run_time).toMatch(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      );
      expect(updated.last_run_time).not.toBe("1970-01-01 00:00:00");
    });

    it("only ever assigns valid status values", () => {
      const allowed = new Set(["Idle", "Running", "Completed", "Error"]);
      const rows = [{ id: 1, status: "Idle", last_run_time: "x" }];
      for (let i = 0; i < 50; i += 1) {
        const next = operationProcessSimulator(rows);
        const status = (next[0] as { status: string }).status;
        expect(allowed.has(status)).toBe(true);
      }
    });
  });
});
