"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createHash } from "node:crypto";
import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import { parseMobileMoney } from "@/lib/finance/parse-momo";
import { toMinor } from "@/lib/money";
import { fromZonedLocalDate, fromZonedLocalDateTime, localDateKey } from "@/lib/dates";
import type { AccountDocument, BudgetDocument, CategoryDocument, DebtDocument, GoalDocument, HabitDocument, LearningItemDocument, NoteDocument, ProjectDocument, ReviewDocument, SavingsGoalDocument, SettingsDocument, TaskDocument, TimeBlockDocument, TimeEntryDocument, TransactionDocument } from "@/server/db/collections";

const id = z.string().regex(/^[a-f\d]{24}$/i);
const optionalId = z.string().transform(value => value === "" ? null : value).pipe(id.nullable());
const text = (max: number) => z.string().trim().min(1).max(max);
const localDate = z.string().trim().optional().transform(value => value || null).refine(value => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), "Invalid date.");
const localDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
class UserActionError extends Error {}
const failure = (error: unknown) => ({ ok: false as const, error: error instanceof UserActionError ? error.message : "Unable to save this item. Please try again." });
const taskFormSchema = z.object({ title: text(160), notes: z.string().trim().max(5000).default(""), priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"), projectId: optionalId.optional(), goalId: optionalId.optional(), dueDate: localDate });
const noteFormSchema = z.object({ title: text(160), body: z.string().trim().max(20000).default(""), type: z.enum(["NOTE", "IDEA", "DECISION", "MEETING", "LINK"]).default("NOTE"), inbox: z.enum(["true", "false"]).default("true") });
const transactionFormSchema = z.object({ accountId: id, categoryId: optionalId.optional(), type: z.enum(["INCOME", "EXPENSE"]), amount: z.coerce.number().positive().finite().max(1_000_000_000_000), note: z.string().trim().max(500).default(""), occurredAt: localDate });

export async function createTaskAction(form: FormData) {
  const parsed = taskFormSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Check the task details and try again."));
  try {
    const userId = await requireUserId(); const db = await getDatabase(); const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }); const timezone = settings?.timezone ?? "Africa/Kigali"; const projectId = parsed.data.projectId ? new ObjectId(parsed.data.projectId) : null; const goalId = parsed.data.goalId ? new ObjectId(parsed.data.goalId) : null;
    if (projectId && !(await db.collection<ProjectDocument>("projects").findOne({ _id: projectId, userId, status: { $in: ["PLANNED", "ACTIVE", "PAUSED"] }, deletedAt: null }))) return failure(new UserActionError("Choose a planned, active, or paused project."));
    if (goalId && !(await db.collection<GoalDocument>("goals").findOne({ _id: goalId, userId, status: "ACTIVE", deletedAt: null }))) return failure(new UserActionError("Choose one of your active goals."));
    const now = new Date();
    const task: TaskDocument = { _id: new ObjectId(), userId, title: parsed.data.title, notes: parsed.data.notes, status: "INBOX", priority: parsed.data.priority, dueDate: parsed.data.dueDate ? fromZonedLocalDate(parsed.data.dueDate, timezone) : null, estimateMin: null, projectId, goalId, isTop3Today: false, createdAt: now, updatedAt: now, deletedAt: null };
    await db.collection<TaskDocument>("tasks").insertOne(task); revalidatePath("/"); revalidatePath("/inbox"); revalidatePath("/tasks"); return { ok: true as const, id: task._id!.toHexString() };
  } catch (error) { return failure(error); }
}

export async function updateTaskAction(taskId: string, form: FormData) {
  if (!id.safeParse(taskId).success) return failure(new UserActionError("Invalid task."));
  const parsed = taskFormSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Check the task details and try again."));
  try {
    const userId = await requireUserId();
    const db = await getDatabase();
    const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null });
    const projectId = parsed.data.projectId ? new ObjectId(parsed.data.projectId) : null;
    const goalId = parsed.data.goalId ? new ObjectId(parsed.data.goalId) : null;
    const [project, goal] = await Promise.all([
      projectId ? db.collection<ProjectDocument>("projects").findOne({ _id: projectId, userId, status: { $in: ["PLANNED", "ACTIVE", "PAUSED"] }, deletedAt: null }) : null,
      goalId ? db.collection<GoalDocument>("goals").findOne({ _id: goalId, userId, status: "ACTIVE", deletedAt: null }) : null,
    ]);
    if (projectId && !project) return failure(new UserActionError("Choose one of your available projects."));
    if (goalId && !goal) return failure(new UserActionError("Choose one of your active goals."));
    const result = await db.collection<TaskDocument>("tasks").updateOne(
      { _id: new ObjectId(taskId), userId, deletedAt: null },
      { $set: { title: parsed.data.title, notes: parsed.data.notes, priority: parsed.data.priority, projectId, goalId, dueDate: parsed.data.dueDate ? fromZonedLocalDate(parsed.data.dueDate, settings?.timezone ?? "Africa/Kigali") : null, updatedAt: new Date() } },
    );
    if (!result.matchedCount) return failure(new UserActionError("Task not found."));
    revalidatePath("/"); revalidatePath("/dashboard"); revalidatePath("/tasks"); revalidatePath("/inbox"); revalidatePath("/projects");
    return { ok: true as const };
  } catch (error) { return failure(error); }
}

export async function deleteTaskAction(taskId: string) {
  if (!id.safeParse(taskId).success) return failure(new UserActionError("Invalid task."));
  try {
    const userId = await requireUserId();
    const db = await getDatabase();
    const _id = new ObjectId(taskId);
    const task = await db.collection<TaskDocument>("tasks").findOne({ _id, userId, deletedAt: null });
    if (!task) return failure(new UserActionError("Task not found."));
    await db.collection<ProjectDocument>("projects").updateMany({ userId, deletedAt: null, nextActionTaskId: _id }, { $set: { nextActionTaskId: null, updatedAt: new Date() } });
    const result = await db.collection<TaskDocument>("tasks").updateOne({ _id, userId, deletedAt: null }, { $set: { deletedAt: new Date(), isTop3Today: false, updatedAt: new Date() } });
    if (!result.matchedCount) return failure(new UserActionError("Task changed before it could be deleted. Refresh and try again."));
    revalidatePath("/"); revalidatePath("/dashboard"); revalidatePath("/tasks"); revalidatePath("/inbox"); revalidatePath("/projects");
    return { ok: true as const };
  } catch (error) { return failure(error); }
}

export async function setTaskStatusAction(taskId: string, status: TaskDocument["status"]) {
  if (!id.safeParse(taskId).success || !["INBOX", "TODO", "DOING", "DONE"].includes(status)) return failure(new UserActionError("Invalid task update."));
  try { const userId = await requireUserId(); const db = await getDatabase(); const result = await db.collection<TaskDocument>("tasks").updateOne({ _id: new ObjectId(taskId), userId, deletedAt: null }, { $set: { status, updatedAt: new Date() } }); if (!result.matchedCount) return failure(new UserActionError("Task not found.")); revalidatePath("/"); revalidatePath("/tasks"); revalidatePath("/inbox"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function setTopTaskAction(taskId: string, selected: boolean) {
  if (!id.safeParse(taskId).success || typeof selected !== "boolean") return failure(new UserActionError("Invalid task."));
  try {
    const userId = await requireUserId(); const db = await getDatabase(); const tasks = db.collection<TaskDocument>("tasks");
    if (selected) { const count = await tasks.countDocuments({ userId, deletedAt: null, isTop3Today: true, status: { $ne: "DONE" }, _id: { $ne: new ObjectId(taskId) } }); if (count >= 3) return failure(new UserActionError("Choose up to three priorities for today.")); }
    const result = await tasks.updateOne({ _id: new ObjectId(taskId), userId, deletedAt: null }, { $set: { isTop3Today: selected, updatedAt: new Date() } }); if (!result.matchedCount) return failure(new UserActionError("Task not found.")); revalidatePath("/"); revalidatePath("/tasks"); return { ok: true as const };
  } catch (error) { return failure(error); }
}

export async function createGoalAction(form: FormData) {
  const parsed = z.object({ title: text(160), why: z.string().trim().max(2000).default(""), area: z.string().trim().min(1).max(80), targetDate: localDate }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Check the goal details and try again."));
  try { const userId = await requireUserId(); const db = await getDatabase(); const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }); const now = new Date(); const goal: GoalDocument = { _id: new ObjectId(), userId, title: parsed.data.title, why: parsed.data.why, area: parsed.data.area, targetDate: parsed.data.targetDate ? fromZonedLocalDate(parsed.data.targetDate, settings?.timezone ?? "Africa/Kigali") : null, status: "ACTIVE", createdAt: now, updatedAt: now, deletedAt: null }; await db.collection<GoalDocument>("goals").insertOne(goal); revalidatePath("/growth"); revalidatePath("/"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function createNoteAction(form: FormData) {
  const parsed = noteFormSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Check the note details and try again."));
  try { const userId = await requireUserId(); const now = new Date(); const note: NoteDocument = { _id: new ObjectId(), userId, title: parsed.data.title, body: parsed.data.body, type: parsed.data.type, inbox: parsed.data.inbox === "true", projectId: null, goalId: null, tags: [], createdAt: now, updatedAt: now, deletedAt: null }; await (await getDatabase()).collection<NoteDocument>("notes").insertOne(note); revalidatePath("/notes"); revalidatePath("/inbox"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function updateNoteAction(noteId: string, form: FormData) {
  if (!id.safeParse(noteId).success) return failure(new UserActionError("Invalid note."));
  const parsed = noteFormSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Check the note details and try again."));
  try {
    const userId = await requireUserId();
    const result = await (await getDatabase()).collection<NoteDocument>("notes").updateOne(
      { _id: new ObjectId(noteId), userId, deletedAt: null },
      { $set: { title: parsed.data.title, body: parsed.data.body, type: parsed.data.type, inbox: parsed.data.inbox === "true", updatedAt: new Date() } },
    );
    if (!result.matchedCount) return failure(new UserActionError("Note not found."));
    revalidatePath("/notes"); revalidatePath("/inbox");
    return { ok: true as const };
  } catch (error) { return failure(error); }
}

export async function deleteNoteAction(noteId: string) {
  if (!id.safeParse(noteId).success) return failure(new UserActionError("Invalid note."));
  try {
    const userId = await requireUserId();
    const result = await (await getDatabase()).collection<NoteDocument>("notes").updateOne(
      { _id: new ObjectId(noteId), userId, deletedAt: null },
      { $set: { deletedAt: new Date(), updatedAt: new Date(), inbox: false } },
    );
    if (!result.matchedCount) return failure(new UserActionError("Note not found."));
    revalidatePath("/notes"); revalidatePath("/inbox"); revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (error) { return failure(error); }
}

export async function setNoteInboxAction(noteId: string, inbox: boolean) {
  if (!id.safeParse(noteId).success) return failure(new UserActionError("Invalid note."));
  try { const userId = await requireUserId(); const result = await (await getDatabase()).collection<NoteDocument>("notes").updateOne({ _id: new ObjectId(noteId), userId, deletedAt: null }, { $set: { inbox, updatedAt: new Date() } }); if (!result.matchedCount) return failure(new UserActionError("Note not found.")); revalidatePath("/inbox"); revalidatePath("/notes"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function createAccountAction(form: FormData) {
  const parsed = z.object({ name: text(80), type: z.enum(["CASH", "MOMO", "BANK", "CARD", "OTHER"]), currency: z.enum(["RWF", "USD"]), openingBalanceMinor: z.coerce.number().int().safe() }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Check account details and enter the opening balance in minor units."));
  try { const userId = await requireUserId(); const now = new Date(); const account: AccountDocument = { _id: new ObjectId(), userId, ...parsed.data, createdAt: now, updatedAt: now, deletedAt: null }; await (await getDatabase()).collection<AccountDocument>("accounts").insertOne(account); revalidatePath("/finance"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function createTransactionAction(form: FormData) {
  const parsed = transactionFormSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Check the transaction details."));
  try { const userId = await requireUserId(); const db = await getDatabase(); const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }); const timezone = settings?.timezone ?? "Africa/Kigali"; const accountId = new ObjectId(parsed.data.accountId); const account = await db.collection<AccountDocument>("accounts").findOne({ _id: accountId, userId, deletedAt: null }); if (!account) return failure(new UserActionError("Select one of your accounts.")); const categoryId = parsed.data.categoryId ? new ObjectId(parsed.data.categoryId) : null; if (categoryId && !(await db.collection<CategoryDocument>("categories").findOne({ _id: categoryId, userId, kind: parsed.data.type, deletedAt: null }))) return failure(new UserActionError("Choose a category that matches the transaction type.")); const amountMinor = toMinor(parsed.data.amount, account.currency); if (amountMinor <= 0) return failure(new UserActionError("Amount is too small to record.")); const now = new Date(); const tx: TransactionDocument = { _id: new ObjectId(), userId, accountId, type: parsed.data.type, amountMinor, currency: account.currency, categoryId, occurredAt: parsed.data.occurredAt ? fromZonedLocalDate(parsed.data.occurredAt, timezone) : now, note: parsed.data.note, projectId: null, importHash: null, createdAt: now, updatedAt: now, deletedAt: null }; await db.collection<TransactionDocument>("transactions").insertOne(tx); revalidatePath("/finance"); revalidatePath("/"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function updateTransactionAction(transactionId: string, form: FormData) {
  if (!id.safeParse(transactionId).success) return failure(new UserActionError("Invalid transaction."));
  const parsed = transactionFormSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Check the transaction details and try again."));
  try {
    const userId = await requireUserId();
    const db = await getDatabase();
    const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null });
    const accountId = new ObjectId(parsed.data.accountId);
    const account = await db.collection<AccountDocument>("accounts").findOne({ _id: accountId, userId, deletedAt: null });
    if (!account) return failure(new UserActionError("Select one of your accounts."));
    const categoryId = parsed.data.categoryId ? new ObjectId(parsed.data.categoryId) : null;
    if (categoryId && !(await db.collection<CategoryDocument>("categories").findOne({ _id: categoryId, userId, kind: parsed.data.type, deletedAt: null }))) return failure(new UserActionError("Choose a category that matches the transaction type."));
    const amountMinor = toMinor(parsed.data.amount, account.currency);
    if (amountMinor <= 0) return failure(new UserActionError("Amount is too small to record."));
    const now = new Date();
    const result = await db.collection<TransactionDocument>("transactions").updateOne(
      { _id: new ObjectId(transactionId), userId, deletedAt: null },
      { $set: { accountId, categoryId, type: parsed.data.type, amountMinor, currency: account.currency, note: parsed.data.note, occurredAt: parsed.data.occurredAt ? fromZonedLocalDate(parsed.data.occurredAt, settings?.timezone ?? "Africa/Kigali") : now, updatedAt: now } },
    );
    if (!result.matchedCount) return failure(new UserActionError("Transaction not found."));
    revalidatePath("/finance"); revalidatePath("/dashboard"); revalidatePath("/api/export");
    return { ok: true as const };
  } catch (error) { return failure(error); }
}

export async function deleteTransactionAction(transactionId: string) {
  if (!id.safeParse(transactionId).success) return failure(new UserActionError("Invalid transaction."));
  try {
    const userId = await requireUserId();
    const result = await (await getDatabase()).collection<TransactionDocument>("transactions").updateOne(
      { _id: new ObjectId(transactionId), userId, deletedAt: null },
      { $set: { deletedAt: new Date(), updatedAt: new Date() } },
    );
    if (!result.matchedCount) return failure(new UserActionError("Transaction not found."));
    revalidatePath("/finance"); revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (error) { return failure(error); }
}

export async function importMobileMoneyAction(form: FormData) {
  const parsed = z.object({ rawText: z.string().trim().min(5).max(8000), accountId: id }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Paste a transaction message and select an account."));
  const candidate = parseMobileMoney(parsed.data.rawText);
  if (!candidate) return failure(new UserActionError("Could not confidently identify an RWF amount and direction. Enter it manually instead."));
  try {
    const userId = await requireUserId(); const db = await getDatabase(); const accountId = new ObjectId(parsed.data.accountId);
    const account = await db.collection<AccountDocument>("accounts").findOne({ _id: accountId, userId, deletedAt: null, currency: "RWF" });
    if (!account) return failure(new UserActionError("Choose an RWF account for this message."));
    const importHash = createHash("sha256").update(parsed.data.rawText).digest("hex"); const now = new Date();
    const tx: TransactionDocument = { _id: new ObjectId(), userId, accountId, type: candidate.direction, amountMinor: candidate.amountMinor, currency: "RWF", categoryId: null, occurredAt: now, note: candidate.counterparty ? `Mobile money · ${candidate.counterparty}` : "Mobile money import", projectId: null, importHash, createdAt: now, updatedAt: now, deletedAt: null };
    await db.collection<TransactionDocument>("transactions").insertOne(tx); revalidatePath("/finance"); revalidatePath("/"); return { ok: true as const };
  } catch (error) { if (error instanceof Error && "code" in error && error.code === 11000) return failure(new UserActionError("This message has already been imported.")); return failure(error); }
}

export async function createCategoryAction(form: FormData) {
  const parsed = z.object({ name: text(60), kind: z.enum(["INCOME", "EXPENSE"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Enter a category name."));
  try { const userId = await requireUserId(); const now = new Date(); const category: CategoryDocument = { _id: new ObjectId(), userId, ...parsed.data, color: "grauzone", createdAt: now, updatedAt: now, deletedAt: null }; await (await getDatabase()).collection<CategoryDocument>("categories").insertOne(category); revalidatePath("/finance"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function createBudgetAction(form: FormData) {
  const parsed = z.object({ categoryId: id, month: z.string().regex(/^\d{4}-\d{2}$/), amount: z.coerce.number().positive().finite().max(1_000_000_000), currency: z.enum(["RWF", "USD"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Check the budget details."));
  try { const userId = await requireUserId(); const db = await getDatabase(); const categoryId = new ObjectId(parsed.data.categoryId); const category = await db.collection<CategoryDocument>("categories").findOne({ _id: categoryId, userId, deletedAt: null, kind: "EXPENSE" }); if (!category) return failure(new UserActionError("Choose one of your expense categories.")); const amountMinor = toMinor(parsed.data.amount, parsed.data.currency); const now = new Date(); const budget: BudgetDocument = { _id: new ObjectId(), userId, categoryId, month: parsed.data.month, amountMinor, currency: parsed.data.currency, createdAt: now, updatedAt: now, deletedAt: null }; await db.collection<BudgetDocument>("budgets").updateOne({ userId, categoryId, month: budget.month }, { $set: { amountMinor, currency: budget.currency, updatedAt: now }, $setOnInsert: { _id: budget._id, userId, categoryId, month: budget.month, createdAt: now, deletedAt: null } }, { upsert: true }); revalidatePath("/finance"); revalidatePath("/"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function createSavingsGoalAction(form: FormData) {
  const parsed = z.object({ name: text(100), target: z.coerce.number().positive().finite().max(1_000_000_000), current: z.coerce.number().min(0).finite().max(1_000_000_000).default(0), currency: z.enum(["RWF", "USD"]), deadline: localDate, isEmergencyFund: z.enum(["true", "false"]).default("false") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Check the savings goal details."));
  try { const userId = await requireUserId(); const db = await getDatabase(); const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }); const now = new Date(); const goal: SavingsGoalDocument = { _id: new ObjectId(), userId, name: parsed.data.name, targetMinor: toMinor(parsed.data.target, parsed.data.currency), currentMinor: toMinor(parsed.data.current, parsed.data.currency), currency: parsed.data.currency, deadline: parsed.data.deadline ? fromZonedLocalDate(parsed.data.deadline, settings?.timezone ?? "Africa/Kigali") : null, isEmergencyFund: parsed.data.isEmergencyFund === "true", createdAt: now, updatedAt: now, deletedAt: null }; await db.collection<SavingsGoalDocument>("savingsGoals").insertOne(goal); revalidatePath("/finance"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function createDebtAction(form: FormData) {
  const parsed = z.object({ direction: z.enum(["OWED_BY_ME", "OWED_TO_ME"]), party: text(100), principal: z.coerce.number().positive().finite().max(1_000_000_000), balance: z.coerce.number().min(0).finite().max(1_000_000_000), currency: z.enum(["RWF", "USD"]), dueDate: localDate }).safeParse(Object.fromEntries(form));
  if (!parsed.success || parsed.data.balance > parsed.data.principal) return failure(new UserActionError("Enter a valid debt and remaining balance."));
  try { const userId = await requireUserId(); const db = await getDatabase(); const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }); const now = new Date(); const debt: DebtDocument = { _id: new ObjectId(), userId, direction: parsed.data.direction, party: parsed.data.party, principalMinor: toMinor(parsed.data.principal, parsed.data.currency), balanceMinor: toMinor(parsed.data.balance, parsed.data.currency), currency: parsed.data.currency, dueDate: parsed.data.dueDate ? fromZonedLocalDate(parsed.data.dueDate, settings?.timezone ?? "Africa/Kigali") : null, createdAt: now, updatedAt: now, deletedAt: null }; await db.collection<DebtDocument>("debts").insertOne(debt); revalidatePath("/finance"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function createTimeBlockAction(form: FormData) {
  const parsed = z.object({ title: text(160), start: localDateTime, end: localDateTime, category: z.string().trim().max(80).default("Focus") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return failure(new UserActionError("Choose a valid time range."));
  try { const userId = await requireUserId(); const db = await getDatabase(); const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }); const timezone = settings?.timezone ?? "Africa/Kigali"; const start = fromZonedLocalDateTime(parsed.data.start, timezone); const end = fromZonedLocalDateTime(parsed.data.end, timezone); if (end <= start) return failure(new UserActionError("Choose a valid time range.")); const conflict = await db.collection<TimeBlockDocument>("timeBlocks").findOne({ userId, deletedAt: null, start: { $lt: end }, end: { $gt: start } }); if (conflict) return failure(new UserActionError("This time overlaps another planned block.")); const now = new Date(); const block: TimeBlockDocument = { _id: new ObjectId(), userId, title: parsed.data.title, start, end, taskId: null, projectId: null, category: parsed.data.category, createdAt: now, updatedAt: now, deletedAt: null }; await db.collection<TimeBlockDocument>("timeBlocks").insertOne(block); revalidatePath("/time"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function startTimerAction(form: FormData) {
  const parsed = z.object({ taskId: optionalId.optional(), projectId: optionalId.optional() }).safeParse(Object.fromEntries(form)); if (!parsed.success) return failure(new UserActionError("Invalid timer context."));
  try { const userId = await requireUserId(); const db = await getDatabase(); const taskId = parsed.data.taskId ? new ObjectId(parsed.data.taskId) : null; const projectId = parsed.data.projectId ? new ObjectId(parsed.data.projectId) : null; if (taskId && !(await db.collection<TaskDocument>("tasks").findOne({ _id: taskId, userId, deletedAt: null, status: { $ne: "DONE" } }))) return failure(new UserActionError("Task not found.")); if (projectId && !(await db.collection<ProjectDocument>("projects").findOne({ _id: projectId, userId, deletedAt: null, status: { $in: ["PLANNED", "ACTIVE", "PAUSED"] } }))) return failure(new UserActionError("Project not found or not schedulable.")); const entries = db.collection<TimeEntryDocument>("timeEntries"); const running = await entries.findOne({ userId, end: null, deletedAt: null }); if (running) return failure(new UserActionError("Stop your running timer before starting another.")); const now = new Date(); await entries.insertOne({ _id: new ObjectId(), userId, start: now, end: null, taskId, projectId, source: "TIMER", createdAt: now, updatedAt: now, deletedAt: null }); revalidatePath("/time"); return { ok: true as const }; } catch (error) { if (error instanceof Error && "code" in error && error.code === 11000) return failure(new UserActionError("Stop your running timer before starting another.")); return failure(error); }
}

export async function stopTimerAction() {
  try { const userId = await requireUserId(); const result = await (await getDatabase()).collection<TimeEntryDocument>("timeEntries").updateOne({ userId, end: null, deletedAt: null }, { $set: { end: new Date(), updatedAt: new Date() } }); if (!result.matchedCount) return failure(new UserActionError("There is no running timer.")); revalidatePath("/time"); revalidatePath("/"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function createHabitAction(form: FormData) {
  const parsed = z.object({ name: text(100), cadence: z.enum(["DAILY", "WEEKLY"]).default("DAILY"), targetPerWeek: z.coerce.number().int().min(1).max(7).default(7) }).safeParse(Object.fromEntries(form)); if (!parsed.success) return failure(new UserActionError("Check the habit details."));
  try { const userId = await requireUserId(); const now = new Date(); const habit: HabitDocument = { _id: new ObjectId(), userId, ...parsed.data, goalId: null, createdAt: now, updatedAt: now, deletedAt: null }; await (await getDatabase()).collection<HabitDocument>("habits").insertOne(habit); revalidatePath("/growth"); revalidatePath("/"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function logHabitAction(habitId: string, status: "DONE" | "SKIPPED") {
  if (!id.safeParse(habitId).success || !["DONE", "SKIPPED"].includes(status)) return failure(new UserActionError("Invalid habit update."));
  try { const userId = await requireUserId(); const db = await getDatabase(); const habitObjectId = new ObjectId(habitId); const exists = await db.collection<HabitDocument>("habits").findOne({ _id: habitObjectId, userId, deletedAt: null }); if (!exists) return failure(new UserActionError("Habit not found.")); const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }); const now = new Date(); const date = localDateKey(now, settings?.timezone ?? "Africa/Kigali"); await db.collection("habitLogs").updateOne({ userId, habitId: habitObjectId, date }, { $set: { status, updatedAt: now }, $setOnInsert: { _id: new ObjectId(), userId, habitId: habitObjectId, date, note: "", createdAt: now, deletedAt: null } }, { upsert: true }); revalidatePath("/growth"); revalidatePath("/"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function createLearningItemAction(form: FormData) {
  const parsed = z.object({ title: text(160), type: z.enum(["COURSE", "BOOK", "VIDEO", "ARTICLE", "SUBJECT"]).default("COURSE") }).safeParse(Object.fromEntries(form)); if (!parsed.success) return failure(new UserActionError("Check the learning item title."));
  try { const userId = await requireUserId(); const now = new Date(); const item: LearningItemDocument = { _id: new ObjectId(), userId, ...parsed.data, status: "PLANNED", progress: 0, goalId: null, createdAt: now, updatedAt: now, deletedAt: null }; await (await getDatabase()).collection<LearningItemDocument>("learningItems").insertOne(item); revalidatePath("/learning"); return { ok: true as const }; } catch (error) { return failure(error); }
}

export async function updateLearningProgressAction(itemId: string, progress: number) {
  if (!id.safeParse(itemId).success || !Number.isInteger(progress) || progress < 0 || progress > 100) return failure(new UserActionError("Choose valid learning progress."));
  try {
    const userId = await requireUserId();
    const result = await (await getDatabase()).collection<LearningItemDocument>("learningItems").updateOne(
      { _id: new ObjectId(itemId), userId, deletedAt: null },
      { $set: { progress, status: progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "PLANNED", updatedAt: new Date() } },
    );
    if (!result.matchedCount) return failure(new UserActionError("Learning item not found."));
    revalidatePath("/learning");
    return { ok: true as const };
  } catch (error) { return failure(error); }
}

export async function createReviewAction(form: FormData) {
  const parsed = z.object({ type: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("WEEKLY"), period: text(20), wins: z.string().trim().max(3000).default(""), lessons: z.string().trim().max(3000).default(""), obstacles: z.string().trim().max(3000).default(""), nextFocus: z.string().trim().max(3000).default("") }).safeParse(Object.fromEntries(form)); if (!parsed.success) return failure(new UserActionError("Check the review details."));
  try { const userId = await requireUserId(); const db = await getDatabase(); const now = new Date(); const review: ReviewDocument = { _id: new ObjectId(), userId, ...parsed.data, createdAt: now, updatedAt: now, deletedAt: null }; await db.collection<ReviewDocument>("reviews").updateOne({ userId, type: review.type, period: review.period }, { $set: { ...review, updatedAt: now } }, { upsert: true }); revalidatePath("/growth"); return { ok: true as const }; } catch (error) { return failure(error); }
}
