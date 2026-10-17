import { describe, expect, it } from "vitest";
import { parseMobileMoney } from "@/lib/finance/parse-momo";

describe("mobile money parser", () => {
  it("extracts a conservative incoming RWF candidate", () => {
    expect(parseMobileMoney("You have received 12,500 RWF from Alice. Fee: 0 RWF. Balance: 20,000 RWF. Ref: AB123456"))
      .toMatchObject({ amountMinor: 12500, direction: "INCOME", counterparty: "Alice", feeMinor: 0, balanceMinor: 20000, transactionId: "AB123456" });
  });

  it("declines ambiguous and oversized input", () => {
    expect(parseMobileMoney("Transaction complete" )).toBeNull();
    expect(parseMobileMoney("x".repeat(8001))).toBeNull();
  });
});
