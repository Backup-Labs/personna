import { describe, expect, it } from "vitest";
import { accountBalance, formatMoney, fromMinor, toMinor } from "@/lib/money";

describe("money utilities", () => {
  it("uses whole RWF francs and USD cents", () => {
    expect(toMinor("12,500", "RWF")).toBe(12500);
    expect(toMinor("12.34", "USD")).toBe(1234);
    expect(fromMinor(1234, "USD")).toBe(12.34);
  });

  it("rejects unsafe amounts", () => {
    expect(() => toMinor("not-money", "RWF")).toThrow();
    expect(() => fromMinor(Number.MAX_SAFE_INTEGER + 1, "RWF")).toThrow();
  });

  it("calculates an account balance without converting currencies", () => {
    const total = accountBalance(1000, [
      { type: "INCOME", amountMinor: 500, accountId: "a" },
      { type: "EXPENSE", amountMinor: 200, accountId: "a" },
      { type: "INCOME", amountMinor: 7000, accountId: "b" },
    ], "a");
    expect(total).toBe(1300);
    expect(formatMoney(total, "RWF", "en-RW")).toContain("1,300");
  });
});
