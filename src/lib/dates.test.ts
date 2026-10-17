import { describe, expect, it } from "vitest";
import { fromZonedLocalDate, fromZonedLocalDateTime, localDateKey, zonedDayRange, zonedMonthStart, zonedWeekStart } from "@/lib/dates";

describe("timezone-aware date helpers", () => {
  it("resolves a Kigali day to its UTC boundaries", () => {
    const date = new Date("2026-10-17T23:30:00.000Z");
    const range = zonedDayRange(date, "Africa/Kigali");
    expect(localDateKey(date, "Africa/Kigali")).toBe("2026-10-18");
    expect(range.start.toISOString()).toBe("2026-10-17T22:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-10-18T22:00:00.000Z");
  });

  it("handles daylight-saving day lengths and calendar period starts", () => {
    const date = new Date("2026-03-08T16:00:00.000Z");
    const range = zonedDayRange(date, "America/New_York");
    expect(range.end.getTime() - range.start.getTime()).toBe(23 * 60 * 60 * 1000);
    expect(zonedMonthStart(date, "America/New_York").toISOString()).toBe("2026-03-01T05:00:00.000Z");
    expect(zonedWeekStart(date, "America/New_York", 1).start).toBe("2026-03-02");
  });

  it("converts date and datetime form values in the configured timezone", () => {
    expect(fromZonedLocalDate("2026-10-18", "Africa/Kigali").toISOString()).toBe("2026-10-17T22:00:00.000Z");
    expect(fromZonedLocalDateTime("2026-10-18T09:30", "Africa/Kigali").toISOString()).toBe("2026-10-18T07:30:00.000Z");
    expect(() => fromZonedLocalDate("2026-02-30", "Africa/Kigali")).toThrow();
  });
});
