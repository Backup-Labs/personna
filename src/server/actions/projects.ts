"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/lib/db";
import { fromZonedLocalDate } from "@/lib/dates";
import { requireUserId } from "@/server/authenticated-user";
import type { GoalDocument, ProjectDocument, SettingsDocument, TaskDocument } from "@/server/db/collections";

const projectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);
const projectFormSchema = z.object({
  title: z.string().trim().min(1, "Add a project name.").max(160, "Project names must be 160 characters or fewer."),
  status: z.enum(["IDEA", "PLANNED", "ACTIVE", "PAUSED", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  deadline: z.string().trim().optional().transform(value => value || null).refine(value => value === null || isLocalDate(value), "Choose a valid deadline."),
  goalId: z.string().optional().transform(value => value || null).refine(value => value === null || /^[a-f\d]{24}$/i.test(value), "Choose a valid goal."),
});
const statuses: ProjectDocument["status"][] = ["IDEA", "PLANNED", "ACTIVE", "PAUSED", "COMPLETED"];

function isLocalDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function projectFailure(message = "Unable to save this project. Please try again.") {
  return { ok: false as const, error: message };
}

function refreshProjectViews() {
  for (const path of ["/projects", "/dashboard", "/tasks", "/finance", "/time", "/notes"]) revalidatePath(path);
}

async function canActivate(db: Awaited<ReturnType<typeof getDatabase>>, userId: ObjectId, activeLimit: number, excludeId?: ObjectId) {
  const activeCount = await db.collection<ProjectDocument>("projects").countDocuments({ userId, status: "ACTIVE", deletedAt: null, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
  return activeCount < activeLimit;
}

async function validGoal(db: Awaited<ReturnType<typeof getDatabase>>, userId: ObjectId, goalId: string | null) {
  if (!goalId) return true;
  return Boolean(await db.collection<GoalDocument>("goals").findOne({ _id: new ObjectId(goalId), userId, status: "ACTIVE", deletedAt: null }));
}

export async function createProjectAction(form: FormData) {
  const parsed = projectFormSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return projectFailure(parsed.error.issues[0]?.message ?? "Check the project details and try again.");

  try {
    const userId = await requireUserId();
    const db = await getDatabase();
    const [settings, goalExists] = await Promise.all([
      db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }),
      validGoal(db, userId, parsed.data.goalId),
    ]);
    if (parsed.data.status === "ACTIVE" && !(await canActivate(db, userId, settings?.activeProjectLimit ?? 5))) return projectFailure("Active project limit reached. Pause a project before activating another.");
    if (!goalExists) return projectFailure("That goal is unavailable. Choose one of your active goals.");
    const now = new Date();
    const project: ProjectDocument = {
      _id: new ObjectId(), userId, title: parsed.data.title, status: parsed.data.status, priority: parsed.data.priority,
      deadline: parsed.data.deadline ? fromZonedLocalDate(parsed.data.deadline, settings?.timezone ?? "Africa/Kigali") : null,
      goalId: parsed.data.goalId ? new ObjectId(parsed.data.goalId) : null, lastActivityAt: now, nextActionTaskId: null,
      createdAt: now, updatedAt: now, deletedAt: null,
    };
    await db.collection<ProjectDocument>("projects").insertOne(project);
    refreshProjectViews();
    return { ok: true as const, id: project._id!.toHexString() };
  } catch {
    return projectFailure();
  }
}

export async function setProjectNextActionAction(projectId: string, taskId: string) {
  if (!projectIdSchema.safeParse(projectId).success || !projectIdSchema.safeParse(taskId).success) return projectFailure("Invalid project or task.");
  try {
    const userId = await requireUserId();
    const db = await getDatabase();
    const projectObjectId = new ObjectId(projectId);
    const taskObjectId = new ObjectId(taskId);
    const [project, task] = await Promise.all([
      db.collection<ProjectDocument>("projects").findOne({ _id: projectObjectId, userId, deletedAt: null, status: "ACTIVE" }),
      db.collection<TaskDocument>("tasks").findOne({ _id: taskObjectId, userId, projectId: projectObjectId, deletedAt: null, status: { $ne: "DONE" } }),
    ]);
    if (!project || !task) return projectFailure("Choose an unfinished task in this active project.");
    const now = new Date();
    const result = await db.collection<ProjectDocument>("projects").updateOne({ _id: projectObjectId, userId, deletedAt: null, status: "ACTIVE" }, { $set: { nextActionTaskId: taskObjectId, updatedAt: now, lastActivityAt: now } });
    if (!result.matchedCount) return projectFailure("Project changed before its next action could be saved.");
    refreshProjectViews();
    return { ok: true as const };
  } catch {
    return projectFailure();
  }
}

export async function updateProjectAction(projectId: string, form: FormData) {
  if (!projectIdSchema.safeParse(projectId).success) return projectFailure("Invalid project.");
  const parsed = projectFormSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return projectFailure(parsed.error.issues[0]?.message ?? "Check the project details and try again.");

  try {
    const userId = await requireUserId();
    const db = await getDatabase();
    const _id = new ObjectId(projectId);
    const [project, settings, goalExists] = await Promise.all([
      db.collection<ProjectDocument>("projects").findOne({ _id, userId, deletedAt: null }),
      db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }),
      validGoal(db, userId, parsed.data.goalId),
    ]);
    if (!project) return projectFailure("Project not found.");
    if (parsed.data.status === "ACTIVE" && project.status !== "ACTIVE" && !(await canActivate(db, userId, settings?.activeProjectLimit ?? 5, _id))) return projectFailure("Active project limit reached. Pause a project before activating another.");
    if (!goalExists) return projectFailure("That goal is unavailable. Choose one of your active goals.");

    const now = new Date();
    const result = await db.collection<ProjectDocument>("projects").updateOne({ _id, userId, deletedAt: null }, {
      $set: {
        title: parsed.data.title, status: parsed.data.status, priority: parsed.data.priority,
        deadline: parsed.data.deadline ? fromZonedLocalDate(parsed.data.deadline, settings?.timezone ?? "Africa/Kigali") : null,
        goalId: parsed.data.goalId ? new ObjectId(parsed.data.goalId) : null, updatedAt: now, lastActivityAt: now,
        ...(parsed.data.status === "COMPLETED" ? { nextActionTaskId: null } : {}),
      },
    });
    if (!result.matchedCount) return projectFailure("Project not found.");
    refreshProjectViews();
    return { ok: true as const };
  } catch {
    return projectFailure();
  }
}

export async function updateProjectStatusAction(projectId: string, status: ProjectDocument["status"]) {
  if (!projectIdSchema.safeParse(projectId).success || !statuses.includes(status)) return projectFailure("Invalid project update.");
  try {
    const userId = await requireUserId();
    const db = await getDatabase();
    const _id = new ObjectId(projectId);
    const current = await db.collection<ProjectDocument>("projects").findOne({ _id, userId, deletedAt: null });
    if (!current) return projectFailure("Project not found.");
    if (status === "ACTIVE" && current.status !== "ACTIVE") {
      const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null });
      if (!(await canActivate(db, userId, settings?.activeProjectLimit ?? 5, _id))) return projectFailure("Active project limit reached. Pause a project before activating another.");
    }

    const now = new Date();
    const result = await db.collection<ProjectDocument>("projects").updateOne({ _id, userId, deletedAt: null }, {
      $set: { status, updatedAt: now, lastActivityAt: now, ...(status === "COMPLETED" ? { nextActionTaskId: null } : {}) },
    });
    if (!result.matchedCount) return projectFailure("Project not found.");
    refreshProjectViews();
    return { ok: true as const };
  } catch {
    return projectFailure();
  }
}

export async function deleteProjectAction(projectId: string) {
  if (!projectIdSchema.safeParse(projectId).success) return projectFailure("Invalid project.");
  try {
    const userId = await requireUserId();
    const db = await getDatabase();
    const _id = new ObjectId(projectId);
    const projects = db.collection<ProjectDocument>("projects");
    const project = await projects.findOne({ _id, userId, deletedAt: null });
    if (!project) return projectFailure("Project not found.");

    // Pause first so new records cannot attach while existing references are detached.
    await projects.updateOne({ _id, userId, deletedAt: null }, { $set: { status: "PAUSED", updatedAt: new Date() } });
    const linked = { projectId: _id, userId };
    await Promise.all([
      db.collection("tasks").updateMany(linked, { $set: { projectId: null, updatedAt: new Date() } }),
      db.collection("timeBlocks").updateMany(linked, { $set: { projectId: null, updatedAt: new Date() } }),
      db.collection("timeEntries").updateMany(linked, { $set: { projectId: null, updatedAt: new Date() } }),
      db.collection("transactions").updateMany(linked, { $set: { projectId: null, updatedAt: new Date() } }),
      db.collection("notes").updateMany(linked, { $set: { projectId: null, updatedAt: new Date() } }),
    ]);
    const now = new Date();
    const result = await projects.updateOne({ _id, userId, deletedAt: null }, { $set: { deletedAt: now, updatedAt: now, nextActionTaskId: null } });
    if (!result.matchedCount) return projectFailure("Project changed before it could be removed. Refresh and try again.");
    refreshProjectViews();
    return { ok: true as const };
  } catch {
    return projectFailure("Project removal was interrupted. It has been paused; retry removal to finish detaching its records.");
  }
}
