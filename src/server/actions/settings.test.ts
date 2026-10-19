import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId, type Db } from "mongodb";

vi.mock("@/lib/db", () => ({ getDatabase: vi.fn() }));
vi.mock("@/server/authenticated-user", () => ({ requireUserId: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("bcryptjs", () => ({ compare: vi.fn(), hash: vi.fn() }));

import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import { compare, hash } from "bcryptjs";
import { changePasswordAction, updateProfileAction, updateSettingsAction } from "@/server/actions/settings";

const userId = new ObjectId("65a000000000000000000001");

function makeForm(values: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

function setupDatabase() {
  const settings = { updateOne: vi.fn(async () => ({ acknowledged: true, matchedCount: 1, modifiedCount: 1 })) };
  const users = {
    updateOne: vi.fn(async () => ({ acknowledged: true, matchedCount: 1, modifiedCount: 1 })),
    findOne: vi.fn(async () => ({ passwordHash: "stored-hash" })),
  };
  const db = { collection: vi.fn((name: string) => name === "settings" ? settings : users) };
  vi.mocked(getDatabase).mockResolvedValue(db as unknown as Db);
  vi.mocked(requireUserId).mockResolvedValue(userId);
  vi.mocked(compare).mockResolvedValue(true as never);
  vi.mocked(hash).mockResolvedValue("new-hash" as never);
  return { db, settings, users };
}

describe("settings actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves validated preferences, including the week start, to the signed-in user's record", async () => {
    const { settings } = setupDatabase();
    const result = await updateSettingsAction(makeForm({ baseCurrency: "USD", locale: "en-US", timezone: "America/New_York", activeProjectLimit: "8", weekStartsOn: "0" }));
    expect(result.ok).toBe(true);
    expect(settings.updateOne).toHaveBeenCalledWith({ userId, deletedAt: null }, expect.objectContaining({ $set: expect.objectContaining({ baseCurrency: "USD", activeProjectLimit: 8, weekStartsOn: 0, timezone: "America/New_York" }) }), { upsert: true });
  });

  it("rejects invalid preferences before touching the database", async () => {
    const { db } = setupDatabase();
    const result = await updateSettingsAction(makeForm({ baseCurrency: "EUR", locale: "x", timezone: "invalid-zone", activeProjectLimit: "1000", weekStartsOn: "2" }));
    expect(result.ok).toBe(false);
    expect(db.collection).not.toHaveBeenCalled();
  });

  it("updates only the authenticated user's display name", async () => {
    const { users } = setupDatabase();
    const result = await updateProfileAction(makeForm({ name: "  Amani  " }));
    expect(result.ok).toBe(true);
    expect(users.updateOne).toHaveBeenCalledWith({ _id: userId, deletedAt: null }, { $set: { name: "Amani", updatedAt: expect.any(Date) } });
  });

  it("requires the current password and stores a hash of the new password", async () => {
    const { users } = setupDatabase();
    const result = await changePasswordAction(makeForm({ currentPassword: "current-password", newPassword: "a-new-long-password", confirmPassword: "a-new-long-password" }));
    expect(compare).toHaveBeenCalledWith("current-password", "stored-hash");
    expect(hash).toHaveBeenCalledWith("a-new-long-password", 12);
    expect(users.updateOne).toHaveBeenCalledWith({ _id: userId, deletedAt: null, passwordHash: "stored-hash" }, { $set: { passwordHash: "new-hash", updatedAt: expect.any(Date) } });
    expect(result.ok).toBe(true);
  });

  it("does not change the password when the current password is wrong", async () => {
    const { users } = setupDatabase();
    vi.mocked(compare).mockResolvedValue(false as never);
    const result = await changePasswordAction(makeForm({ currentPassword: "incorrect", newPassword: "a-new-long-password", confirmPassword: "a-new-long-password" }));
    expect(result.ok).toBe(false);
    expect(hash).not.toHaveBeenCalled();
    expect(users.updateOne).not.toHaveBeenCalled();
  });
});
