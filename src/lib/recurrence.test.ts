import { describe, expect, it } from "vitest";
import { nextOccurrences } from "@/lib/recurrence";

describe("recurrence", () => {
  it("generates daily occurrences at an interval", () => {
    const result = nextOccurrences(new Date("2026-01-01T09:00:00Z"), { frequency: "DAILY", interval: 2 }, 3);
    expect(result.map(date => date.toISOString())).toEqual(["2026-01-01T09:00:00.000Z", "2026-01-03T09:00:00.000Z", "2026-01-05T09:00:00.000Z"]);
  });

  it("supports selected weekdays and validates bounds", () => {
    const result = nextOccurrences(new Date("2026-01-05T09:00:00Z"), { frequency: "WEEKLY", weekdays: [1, 3] }, 3);
    expect(result.map(date => date.getUTCDay())).toEqual([1, 3, 1]);
    expect(() => nextOccurrences(new Date(), { frequency: "DAILY" }, 400)).toThrow();
  });
});
