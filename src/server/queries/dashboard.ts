import { ObjectId } from "mongodb";
import type { Db } from "mongodb";
import type { ProjectDocument, SettingsDocument, TaskDocument } from "@/server/db/collections";

export async function getDashboardData(db: Db, userId: ObjectId, now = new Date()) {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [topTasks, dueTasks, overdueCount, projects, settings] = await Promise.all([
    db.collection<TaskDocument>("tasks").find({ userId, deletedAt: null, isTop3Today: true, status: { $ne: "DONE" } }).sort({ createdAt: 1 }).limit(3).toArray(),
    db.collection<TaskDocument>("tasks").find({ userId, deletedAt: null, dueDate: { $gte: dayStart, $lt: dayEnd }, status: { $ne: "DONE" } }).sort({ dueDate: 1 }).toArray(),
    db.collection<TaskDocument>("tasks").countDocuments({ userId, deletedAt: null, dueDate: { $lt: dayStart }, status: { $ne: "DONE" } }),
    db.collection<ProjectDocument>("projects").find({ userId, deletedAt: null, status: "ACTIVE" }).sort({ lastActivityAt: -1 }).limit(5).toArray(),
    db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }),
  ]);

  return { topTasks, dueTasks, overdueCount, activeProjects: projects, settings };
}
