import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "mongodb";

vi.mock("@/lib/db", () => ({ getDatabase: vi.fn() }));

import { getDatabase } from "@/lib/db";
import { GET } from "@/app/api/ready/route";

describe("readiness endpoint", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reports ready only after MongoDB responds to ping", async () => {
    const command = vi.fn().mockResolvedValue({ ok: 1 });
    vi.mocked(getDatabase).mockResolvedValue({ command } as unknown as Db);

    const response = await GET();
    expect(command).toHaveBeenCalledWith({ ping: 1 });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ready" });
  });

  it("returns a generic not-ready response without leaking connection details", async () => {
    vi.mocked(getDatabase).mockRejectedValue(new Error("Mongo URI contains private credentials"));

    const response = await GET();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ status: "not_ready" });
  });
});
