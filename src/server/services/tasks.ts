import { ObjectId, type Db, type Filter } from "mongodb";
import { z } from "zod";
import type { TaskDocument } from "@/server/db/collections";

const createTaskInput = z.object({
  title: z.string().trim().min(1).max(160),
  notes: z.string().trim().max(5_000).default(""),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.coerce.date().nullable().default(null),
  estimateMin: z.number().int().positive().max(24 * 60).nullable().default(null),
  projectId: z.string().regex(/^[a-f\d]{24}$/i).nullable().default(null),
  goalId: z.string().regex(/^[a-f\d]{24}$/i).nullable().default(null),
});

export type CreateTaskInput = z.input<typeof createTaskInput>;

/** The caller must supply the authenticated user ID; all lookups and writes remain scoped to it. */
export async function createTask(db: Db, userId: ObjectId, input: CreateTaskInput): Promise<TaskDocument> {
  const values = createTaskInput.parse(input);
  const now = new Date();
  const task: TaskDocument = {
    _id: new ObjectId(),
    userId,
    title: values.title,
    notes: values.notes,
    status: "INBOX",
    priority: values.priority,
    dueDate: values.dueDate,
    estimateMin: values.estimateMin,
    projectId: values.projectId ? new ObjectId(values.projectId) : null,
    goalId: values.goalId ? new ObjectId(values.goalId) : null,
    isTop3Today: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  await db.collection<TaskDocument>("tasks").insertOne(task);
  return task;
}

export async function listTasks(db: Db, userId: ObjectId, status?: TaskDocument["status"]): Promise<TaskDocument[]> {
  const filter: Filter<TaskDocument> = { userId, deletedAt: null };
  if (status) filter.status = status;
  return db.collection<TaskDocument>("tasks").find(filter).sort({ dueDate: 1, createdAt: -1 }).toArray();
}

export async function setTaskStatus(
  db: Db,
  userId: ObjectId,
  taskId: string,
  status: TaskDocument["status"],
): Promise<boolean> {
  if (!/^[a-f\d]{24}$/i.test(taskId)) return false;
  const result = await db.collection<TaskDocument>("tasks").updateOne(
    { _id: new ObjectId(taskId), userId, deletedAt: null },
    { $set: { status, updatedAt: new Date() } },
  );
  return result.matchedCount === 1;
}
