import {
  eventCalendarSimulator,
  eventStreamSimulator,
  reverseInquirySimulator,
} from "@/lib/grid-simulators/events";

describe("events simulators", () => {
  describe("eventCalendarSimulator", () => {
    it("returns a fresh array reference", () => {
      const rows = [{ id: 1, ticker: "X", time: "9:30 AM" }];
      const next = eventCalendarSimulator(rows);
      expect(next).not.toBe(rows);
    });

    it("formats time as H:MM AM/PM", () => {
      const rows = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        ticker: `T${i}`,
        time: "9:30 AM",
      }));
      const next = eventCalendarSimulator(rows);
      const changed = next.find((row, i) => row !== rows[i]);
      expect(changed).toBeDefined();
      expect(changed?.time).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
    });

    it("returns the same empty array when rows are empty", () => {
      const empty: { time?: string }[] = [];
      expect(eventCalendarSimulator(empty)).toBe(empty);
    });
  });

  describe("eventStreamSimulator", () => {
    it("stamps updated_time as YYYY-MM-DD HH:MM:SS", () => {
      const rows = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        symbol: `S${i}`,
        updated_time: "2025-01-01 00:00:00",
      }));
      const next = eventStreamSimulator(rows);
      const changed = next.find((row, i) => row !== rows[i]);
      expect(changed).toBeDefined();
      expect(changed?.updated_time).toMatch(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      );
    });

    it("returns a fresh array reference", () => {
      const rows = [{ id: 1, symbol: "X", updated_time: "—" }];
      expect(eventStreamSimulator(rows)).not.toBe(rows);
    });
  });

  describe("reverseInquirySimulator", () => {
    it("formats deal_point as `<int> bps`", () => {
      const rows = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        ticker: `T${i}`,
        deal_point: "100 bps",
      }));
      const next = reverseInquirySimulator(rows);
      const changed = next.find((row, i) => row !== rows[i]);
      expect(changed).toBeDefined();
      expect(changed?.deal_point).toMatch(/^-?\d+ bps$/);
    });

    it("does not touch rows whose deal_point is empty", () => {
      const rows = [{ id: 1, ticker: "X", deal_point: "" }];
      const next = reverseInquirySimulator(rows);
      expect(next[0].deal_point).toBe("");
    });

    it("returns the same empty array when rows are empty", () => {
      const empty: { deal_point?: string }[] = [];
      expect(reverseInquirySimulator(empty)).toBe(empty);
    });
  });
});
