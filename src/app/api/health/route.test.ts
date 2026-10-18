import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ getDatabase: vi.fn() }));

import { GET } from "@/app/api/health/route";

describe("health endpoint", () => {
  it("returns a no-store liveness response", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
