import {
  emsxOrderSimulator,
  emsxRouteSimulator,
} from "@/lib/grid-simulators/orders";

describe("orders simulators", () => {
  describe("emsxOrderSimulator", () => {
    it("returns the same array when there are no rows", () => {
      const empty: { emsx_filled?: string }[] = [];
      expect(emsxOrderSimulator(empty)).toBe(empty);
    });

    it("returns a fresh array and bumps emsx_filled forward", () => {
      const rows = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        emsx_filled: "1,000",
      }));
      const next = emsxOrderSimulator(rows);
      expect(next).not.toBe(rows);
      // Exactly one row should have changed (Reflex picks a single random index).
      const changed = next.filter((row, i) => row !== rows[i]);
      expect(changed.length).toBe(1);
      const changedValue = (changed[0] as { emsx_filled: string }).emsx_filled;
      // Comma-formatted integer.
      expect(changedValue).toMatch(/^[\d,]+$/);
      // Bumped by [100, 1000] from 1000 → result is between 1100 and 2000.
      const numeric = Number(changedValue.replace(/,/g, ""));
      expect(numeric).toBeGreaterThanOrEqual(1100);
      expect(numeric).toBeLessThanOrEqual(2000);
    });

    it("reseeds emsx_filled if the value is unparseable", () => {
      const rows = [{ id: 1, emsx_filled: "not-a-number" }];
      const next = emsxOrderSimulator(rows);
      const value = (next[0] as { emsx_filled: string }).emsx_filled;
      expect(value).toMatch(/^[\d,]+$/);
      const numeric = Number(value.replace(/,/g, ""));
      expect(numeric).toBeGreaterThanOrEqual(1000);
      expect(numeric).toBeLessThanOrEqual(5000);
    });
  });

  describe("emsxRouteSimulator", () => {
    it("returns the same array when there are no rows", () => {
      const empty: { filled_quantity?: number }[] = [];
      expect(emsxRouteSimulator(empty)).toBe(empty);
    });

    it("bumps filled_quantity by 50..500 and preserves number type", () => {
      const rows = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        filled_quantity: 1000,
      }));
      const next = emsxRouteSimulator(rows);
      const changed = next.filter((row, i) => row !== rows[i]);
      expect(changed.length).toBe(1);
      const value = (changed[0] as { filled_quantity: number }).filled_quantity;
      expect(typeof value).toBe("number");
      expect(value).toBeGreaterThanOrEqual(1050);
      expect(value).toBeLessThanOrEqual(1500);
    });

    it("reseeds filled_quantity if the value is missing", () => {
      const rows: Array<{ id: number; filled_quantity?: number }> = [
        { id: 1 },
      ];
      const next = emsxRouteSimulator(rows);
      const value = (next[0] as { filled_quantity: number }).filled_quantity;
      // Missing → parsed as 0 → bumped by 50..500.
      expect(value).toBeGreaterThanOrEqual(50);
      expect(value).toBeLessThanOrEqual(500);
    });
  });
});
