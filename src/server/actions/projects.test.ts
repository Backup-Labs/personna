import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId, type Db } from "mongodb";

vi.mock("@/lib/db", () => ({ getDatabase: vi.fn() }));
vi.mock("@/server/authenticated-user", () => ({ requireUserId: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import { createProjectAction, deleteProjectAction, setProjectNextActionAction, updateProjectAction, updateProjectStatusAction } from "@/server/actions/projects";

const userId = new ObjectId("65a000000000000000000001");
const projectId = new ObjectId("65a000000000000000000002");
const taskId = new ObjectId("65a000000000000000000003");
const goalId = new ObjectId("65a000000000000000000004");
const project = {
  _id: projectId, userId, title: "Portfolio", status: "PLANNED" as const, priority: "MEDIUM" as const,
  deadline: null, goalId: null, lastActivityAt: new Date("2026-01-01"), nextActionTaskId: null,
  createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01"), deletedAt: null,
};

function setupDatabase() {
  const projectCollection = {
    findOne: vi.fn(async (filter: Record<string, unknown>): Promise<unknown> => filter.userId instanceof ObjectId && filter.userId.equals(userId) && filter._id instanceof ObjectId && filter._id.equals(projectId) ? project : null),
    countDocuments: vi.fn(async () => 0),
    insertOne: vi.fn(async (...args: unknown[]) => { void args; return { acknowledged: true, insertedId: projectId }; }),
    updateOne: vi.fn(async (...args: unknown[]) => { void args; return { acknowledged: true, matchedCount: 1, modifiedCount: 1 }; }),
  };
  const settingsCollection = { findOne: vi.fn(async (): Promise<unknown> => ({ timezone: "Africa/Kigali", activeProjectLimit: 5 })) };
  const goalsCollection = { findOne: vi.fn(async (): Promise<unknown> => ({ _id: goalId, userId, status: "ACTIVE", deletedAt: null })) };
  const updateMany = () => vi.fn(async (...args: unknown[]) => { void args; return { acknowledged: true, matchedCount: 1, modifiedCount: 1 }; });
  const tasksCollection = { findOne: vi.fn(async (): Promise<unknown> => ({ _id: taskId, userId, projectId, status: "TODO", deletedAt: null })), updateMany: updateMany() };
  const relatedCollections = new Map<string, { updateMany: ReturnType<typeof updateMany> }>(["timeBlocks", "timeEntries", "transactions", "notes"].map(name => [name, { updateMany: updateMany() }]));
  relatedCollections.set("tasks", tasksCollection);
  const collections = new Map<string, unknown>([
    ["projects", projectCollection], ["settings", settingsCollection], ["goals", goalsCollection],
    ["tasks", tasksCollection], ...relatedCollections,
  ]);
  const db = {
    collection: vi.fn((name: string) => collections.get(name)),
  };
  vi.mocked(getDatabase).mockResolvedValue(db as unknown as Db);
  vi.mocked(requireUserId).mockResolvedValue(userId);
  return { db, projectCollection, settingsCollection, goalsCollection, tasksCollection, relatedCollections };
}

function projectForm(values: Partial<Record<"title" | "status" | "priority" | "deadline" | "goalId", string>> = {}) {
  const form = new FormData();
  form.set("title", values.title ?? "Portfolio");
  form.set("status", values.status ?? "PLANNED");
  form.set("priority", values.priority ?? "MEDIUM");
  form.set("deadline", values.deadline ?? "");
  form.set("goalId", values.goalId ?? "");
  return form;
}

describe("project server actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects invalid or blank project forms before touching the database", async () => {
    const { db } = setupDatabase();
    const result = await createProjectAction(projectForm({ title: "   ", deadline: "2026-02-30" }));
    expect(result.ok).toBe(false);
    expect(db.collection).not.toHaveBeenCalled();
  });

  it("enforces the active project limit during creation", async () => {
    const { projectCollection } = setupDatabase();
    projectCollection.countDocuments.mockResolvedValue(5);
    const result = await createProjectAction(projectForm({ status: "ACTIVE" }));
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("limit") });
    expect(projectCollection.insertOne).not.toHaveBeenCalled();
  });

  it("creates a normalized project with a timezone-aware deadline and owned goal", async () => {
    const { projectCollection, goalsCollection } = setupDatabase();
    const result = await createProjectAction(projectForm({ title: "  Portfolio  ", deadline: "2026-10-18", goalId: goalId.toHexString() }));
    expect(result.ok).toBe(true);
    expect(goalsCollection.findOne).toHaveBeenCalledWith(expect.objectContaining({ _id: goalId, userId }));
    const inserted = projectCollection.insertOne.mock.calls[0]?.[0] as Record<string, unknown> | undefined;
    expect(inserted).toMatchObject({ title: "Portfolio", userId, goalId, status: "PLANNED" });
    expect(inserted?.deadline).toBeInstanceOf(Date);
  });

  it("rejects goal references that do not belong to the current user", async () => {
    const { projectCollection, goalsCollection } = setupDatabase();
    goalsCollection.findOne.mockResolvedValue(null);
    const result = await createProjectAction(projectForm({ goalId: goalId.toHexString() }));
    expect(result.ok).toBe(false);
    expect(projectCollection.insertOne).not.toHaveBeenCalled();
  });

  it("does not update a project owned by a different user", async () => {
    const { projectCollection } = setupDatabase();
    projectCollection.findOne.mockResolvedValue(null);
    const result = await updateProjectAction(projectId.toHexString(), projectForm());
    expect(result).toMatchObject({ ok: false, error: "Project not found." });
    expect(projectCollection.updateOne).not.toHaveBeenCalled();
  });

  it("rejects malformed deadlines and invalid identifiers on update", async () => {
    setupDatabase();
    expect((await updateProjectAction("invalid", projectForm())).ok).toBe(false);
    expect((await updateProjectAction(projectId.toHexString(), projectForm({ deadline: "tomorrow" }))).ok).toBe(false);
  });

  it("updates project metadata and removes the next action when it is completed", async () => {
    const { projectCollection } = setupDatabase();
    projectCollection.findOne.mockResolvedValue({ ...project, status: "ACTIVE", nextActionTaskId: taskId });
    const result = await updateProjectAction(projectId.toHexString(), projectForm({ title: "  Ship portfolio  ", status: "COMPLETED", priority: "HIGH", deadline: "2026-10-18" }));
    expect(result.ok).toBe(true);
    expect(projectCollection.updateOne).toHaveBeenCalledWith(expect.objectContaining({ _id: projectId, userId, deletedAt: null }), expect.objectContaining({ $set: expect.objectContaining({ title: "Ship portfolio", status: "COMPLETED", priority: "HIGH", nextActionTaskId: null }) }));
  });

  it("enforces the active limit when moving a project into active work", async () => {
    const { projectCollection } = setupDatabase();
    projectCollection.findOne.mockResolvedValue({ ...project, status: "PAUSED" });
    projectCollection.countDocuments.mockResolvedValue(5);
    const result = await updateProjectStatusAction(projectId.toHexString(), "ACTIVE");
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("limit") });
    expect(projectCollection.updateOne).not.toHaveBeenCalled();
  });

  it("clears the next-action reference when completing a project", async () => {
    const { projectCollection } = setupDatabase();
    projectCollection.findOne.mockResolvedValue({ ...project, status: "ACTIVE", nextActionTaskId: taskId });
    const result = await updateProjectStatusAction(projectId.toHexString(), "COMPLETED");
    expect(result.ok).toBe(true);
    expect(projectCollection.updateOne).toHaveBeenCalledWith(expect.objectContaining({ _id: projectId, userId }), expect.objectContaining({ $set: expect.objectContaining({ status: "COMPLETED", nextActionTaskId: null }) }));
  });

  it("rejects invalid status values without writing", async () => {
    const { projectCollection } = setupDatabase();
    const result = await updateProjectStatusAction(projectId.toHexString(), "UNKNOWN" as never);
    expect(result.ok).toBe(false);
    expect(projectCollection.updateOne).not.toHaveBeenCalled();
  });

  it("accepts only an unfinished task linked to the owned active project", async () => {
    const { projectCollection, tasksCollection } = setupDatabase();
    projectCollection.findOne.mockResolvedValue({ ...project, status: "ACTIVE" });
    const result = await setProjectNextActionAction(projectId.toHexString(), taskId.toHexString());
    expect(result.ok).toBe(true);
    expect(tasksCollection.findOne).toHaveBeenCalledWith(expect.objectContaining({ _id: taskId, userId, projectId, status: { $ne: "DONE" } }));
    expect(projectCollection.updateOne).toHaveBeenCalledWith(expect.objectContaining({ _id: projectId, userId, status: "ACTIVE" }), expect.objectContaining({ $set: expect.objectContaining({ nextActionTaskId: taskId }) }));
  });

  it("does not set a next action from a task outside the project or already completed", async () => {
    const { projectCollection, tasksCollection } = setupDatabase();
    tasksCollection.findOne.mockResolvedValue(null);
    const result = await setProjectNextActionAction(projectId.toHexString(), taskId.toHexString());
    expect(result.ok).toBe(false);
    expect(projectCollection.updateOne).not.toHaveBeenCalled();
  });

  it("detaches all linked records before soft-deleting the project", async () => {
    const { projectCollection, relatedCollections } = setupDatabase();
    const result = await deleteProjectAction(projectId.toHexString());
    expect(result.ok).toBe(true);
    for (const collection of relatedCollections.values()) {
      expect(collection.updateMany).toHaveBeenCalledWith({ projectId, userId }, { $set: expect.objectContaining({ projectId: null, updatedAt: expect.any(Date) }) });
    }
    expect(projectCollection.updateOne).toHaveBeenCalledTimes(2);
    expect(projectCollection.updateOne.mock.calls[0]?.[1]).toMatchObject({ $set: { status: "PAUSED" } });
    expect(projectCollection.updateOne.mock.calls[1]?.[1]).toMatchObject({ $set: { deletedAt: expect.any(Date), nextActionTaskId: null } });
  });

  it("does not delete a project belonging to another account", async () => {
    const { projectCollection, relatedCollections } = setupDatabase();
    projectCollection.findOne.mockResolvedValue(null);
    const result = await deleteProjectAction(projectId.toHexString());
    expect(result).toMatchObject({ ok: false, error: "Project not found." });
    expect(projectCollection.updateOne).not.toHaveBeenCalled();
    for (const collection of relatedCollections.values()) expect(collection.updateMany).not.toHaveBeenCalled();
  });

  it("keeps an interrupted deletion retryable by leaving the project paused", async () => {
    const { projectCollection, relatedCollections } = setupDatabase();
    relatedCollections.get("notes")!.updateMany.mockRejectedValue(new Error("database unavailable"));
    const result = await deleteProjectAction(projectId.toHexString());
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("paused") });
    expect(projectCollection.updateOne).toHaveBeenCalledTimes(1);
    expect(projectCollection.updateOne.mock.calls[0]?.[1]).toMatchObject({ $set: { status: "PAUSED" } });
  });
});
