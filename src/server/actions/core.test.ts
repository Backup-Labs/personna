import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId, type Db } from "mongodb";

vi.mock("@/lib/db", () => ({ getDatabase: vi.fn() }));
vi.mock("@/server/authenticated-user", () => ({ requireUserId: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import { createTaskAction, deleteNoteAction, deleteTaskAction, deleteTransactionAction, updateNoteAction, updateTaskAction, updateTransactionAction } from "@/server/actions/core";

describe("core server action failures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a generic error when persistence fails instead of exposing database details", async () => {
    const userId = new ObjectId("65a000000000000000000001");
    const insertOne = vi.fn().mockRejectedValue(new Error("MongoServerError: secret connection string"));
    const db = { collection: vi.fn((name: string) => name === "settings" ? { findOne: vi.fn().mockResolvedValue(null) } : { insertOne }) };
    vi.mocked(getDatabase).mockResolvedValue(db as unknown as Db);
    vi.mocked(requireUserId).mockResolvedValue(userId);
    const form = new FormData();
    form.set("title", "Ship the first release");

    await expect(createTaskAction(form)).resolves.toEqual({ ok: false, error: "Unable to save this item. Please try again." });
    expect(insertOne).toHaveBeenCalledOnce();
  });

  it("keeps clear validation messages for user-correctable input", async () => {
    const form = new FormData();
    form.set("title", " ");

    await expect(createTaskAction(form)).resolves.toEqual({ ok: false, error: "Check the task details and try again." });
    expect(getDatabase).not.toHaveBeenCalled();
  });

  it("updates task fields only for a task owned by the signed-in user", async () => {
    const userId = new ObjectId("65a000000000000000000001");
    const taskId = new ObjectId("65a000000000000000000002");
    const updateOne = vi.fn().mockResolvedValue({ matchedCount: 1 });
    const db = { collection: vi.fn((name: string) => name === "settings" ? { findOne: vi.fn().mockResolvedValue(null) } : { updateOne }) };
    vi.mocked(getDatabase).mockResolvedValue(db as unknown as Db);
    vi.mocked(requireUserId).mockResolvedValue(userId);
    const form = new FormData();
    form.set("title", "Updated task");
    form.set("notes", "A clearer next step");
    form.set("priority", "HIGH");
    form.set("projectId", "");
    form.set("goalId", "");
    form.set("dueDate", "");

    await expect(updateTaskAction(taskId.toHexString(), form)).resolves.toMatchObject({ ok: true });
    expect(updateOne).toHaveBeenCalledWith(
      { _id: taskId, userId, deletedAt: null },
      expect.objectContaining({ $set: expect.objectContaining({ title: "Updated task", notes: "A clearer next step", priority: "HIGH" }) }),
    );
  });

  it("soft deletes a task and clears its project next-action reference", async () => {
    const userId = new ObjectId("65a000000000000000000001");
    const taskId = new ObjectId("65a000000000000000000002");
    const updateOne = vi.fn().mockResolvedValue({ matchedCount: 1 });
    const updateMany = vi.fn().mockResolvedValue({ matchedCount: 1 });
    const db = { collection: vi.fn((name: string) => name === "tasks"
      ? { findOne: vi.fn().mockResolvedValue({ _id: taskId, userId }), updateOne }
      : { updateMany }) };
    vi.mocked(getDatabase).mockResolvedValue(db as unknown as Db);
    vi.mocked(requireUserId).mockResolvedValue(userId);

    await expect(deleteTaskAction(taskId.toHexString())).resolves.toMatchObject({ ok: true });
    expect(updateMany).toHaveBeenCalledWith({ userId, deletedAt: null, nextActionTaskId: taskId }, { $set: expect.objectContaining({ nextActionTaskId: null }) });
    expect(updateOne).toHaveBeenCalledWith({ _id: taskId, userId, deletedAt: null }, { $set: expect.objectContaining({ deletedAt: expect.any(Date), isTop3Today: false }) });
  });

  it("updates an owned note and its inbox state", async () => {
    const userId = new ObjectId("65a000000000000000000001");
    const noteId = new ObjectId("65a000000000000000000002");
    const updateOne = vi.fn().mockResolvedValue({ matchedCount: 1 });
    vi.mocked(getDatabase).mockResolvedValue({ collection: vi.fn(() => ({ updateOne })) } as unknown as Db);
    vi.mocked(requireUserId).mockResolvedValue(userId);
    const form = new FormData();
    form.set("title", "Decision log");
    form.set("type", "DECISION");
    form.set("body", "We will ship the task flow first.");
    form.set("inbox", "false");

    await expect(updateNoteAction(noteId.toHexString(), form)).resolves.toMatchObject({ ok: true });
    expect(updateOne).toHaveBeenCalledWith({ _id: noteId, userId, deletedAt: null }, { $set: expect.objectContaining({ title: "Decision log", type: "DECISION", inbox: false }) });
  });

  it("soft deletes notes using an owner-scoped query", async () => {
    const userId = new ObjectId("65a000000000000000000001");
    const noteId = new ObjectId("65a000000000000000000002");
    const updateOne = vi.fn().mockResolvedValue({ matchedCount: 1 });
    vi.mocked(getDatabase).mockResolvedValue({ collection: vi.fn(() => ({ updateOne })) } as unknown as Db);
    vi.mocked(requireUserId).mockResolvedValue(userId);

    await expect(deleteNoteAction(noteId.toHexString())).resolves.toMatchObject({ ok: true });
    expect(updateOne).toHaveBeenCalledWith({ _id: noteId, userId, deletedAt: null }, { $set: expect.objectContaining({ deletedAt: expect.any(Date), inbox: false }) });
  });

  it("updates a transaction against an account owned by the current user", async () => {
    const userId = new ObjectId("65a000000000000000000001");
    const transactionId = new ObjectId("65a000000000000000000002");
    const accountId = new ObjectId("65a000000000000000000003");
    const updateOne = vi.fn().mockResolvedValue({ matchedCount: 1 });
    const db = { collection: vi.fn((name: string) => {
      if (name === "settings") return { findOne: vi.fn().mockResolvedValue({ timezone: "Africa/Kigali" }) };
      if (name === "accounts") return { findOne: vi.fn().mockResolvedValue({ _id: accountId, currency: "USD" }) };
      return { updateOne };
    }) };
    vi.mocked(getDatabase).mockResolvedValue(db as unknown as Db);
    vi.mocked(requireUserId).mockResolvedValue(userId);
    const form = new FormData();
    form.set("accountId", accountId.toHexString());
    form.set("categoryId", "");
    form.set("type", "EXPENSE");
    form.set("amount", "10.50");
    form.set("note", "Updated purchase");
    form.set("occurredAt", "2026-10-18");

    await expect(updateTransactionAction(transactionId.toHexString(), form)).resolves.toMatchObject({ ok: true });
    expect(updateOne).toHaveBeenCalledWith(
      { _id: transactionId, userId, deletedAt: null },
      { $set: expect.objectContaining({ accountId, currency: "USD", amountMinor: 1050, note: "Updated purchase" }) },
    );
  });

  it("soft deletes a transaction for recalculated balances", async () => {
    const userId = new ObjectId("65a000000000000000000001");
    const transactionId = new ObjectId("65a000000000000000000002");
    const updateOne = vi.fn().mockResolvedValue({ matchedCount: 1 });
    vi.mocked(getDatabase).mockResolvedValue({ collection: vi.fn(() => ({ updateOne })) } as unknown as Db);
    vi.mocked(requireUserId).mockResolvedValue(userId);

    await expect(deleteTransactionAction(transactionId.toHexString())).resolves.toMatchObject({ ok: true });
    expect(updateOne).toHaveBeenCalledWith({ _id: transactionId, userId, deletedAt: null }, { $set: expect.objectContaining({ deletedAt: expect.any(Date) }) });
  });
});
