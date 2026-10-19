import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connect: vi.fn(), close: vi.fn(), db: vi.fn(() => ({})), ensureIndexes: vi.fn() }));

vi.mock("mongodb", () => ({ MongoClient: class { connect = mocks.connect; close = mocks.close; db = mocks.db; } }));
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: () => { throw new Error("not running in a Worker"); } }));
vi.mock("@/server/db/indexes", () => ({ ensureIndexes: mocks.ensureIndexes }));
vi.mock("@/lib/env", () => ({ getEnvironment: () => ({ MONGODB_URI: "mongodb://test.invalid", MONGODB_DB: "personna_test" }) }));

import { getDatabase } from "@/lib/db";

describe("MongoDB connection recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.personnaMongoClient = undefined;
    globalThis.personnaDatabase = undefined;
  });

  it("allows a later request to reconnect after an initial connection failure", async () => {
    const expectedDb = {};
    mocks.db.mockReturnValue(expectedDb);
    mocks.connect.mockRejectedValueOnce(new Error("temporary connection closed")).mockImplementationOnce(async function (this: { db: typeof mocks.db }) { return this; });
    mocks.ensureIndexes.mockResolvedValue(undefined);

    await expect(getDatabase()).rejects.toThrow("temporary connection closed");
    await expect(getDatabase()).resolves.toBe(expectedDb);
    expect(mocks.connect).toHaveBeenCalledTimes(2);
    expect(mocks.ensureIndexes).toHaveBeenCalledTimes(1);
  });
});
