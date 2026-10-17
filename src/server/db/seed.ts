import { ObjectId, type Collection, type Filter } from "mongodb";
import { hash } from "bcryptjs";
import { loadEnvConfig } from "@next/env";
import { getDatabase } from "@/lib/db";
import { localDateKey, zonedDayRange } from "@/lib/dates";
import { ensureIndexes } from "./indexes";
import type { AccountDocument, BudgetDocument, CategoryDocument, DebtDocument, GoalDocument, HabitDocument, HabitLogDocument, LearningItemDocument, NoteDocument, ProjectDocument, ReviewDocument, SavingsGoalDocument, SettingsDocument, TaskDocument, TimeBlockDocument, TimeEntryDocument, TransactionDocument, UserDocument } from "./collections";

loadEnvConfig(process.cwd());

async function ensure<T extends { _id?: ObjectId }>(collection: Collection<T>, filter: Filter<T>, document: T): Promise<T & { _id: ObjectId }> {
  await collection.updateOne(filter, { $setOnInsert: document }, { upsert: true });
  const found = await collection.findOne(filter);
  if (!found?._id) throw new Error(`Could not seed ${collection.collectionName}.`);
  return found as T & { _id: ObjectId };
}

async function seed(): Promise<void> {
  const email = process.env.SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_PASSWORD;
  if (!email || !password || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) throw new Error("Set SEED_EMAIL and a SEED_PASSWORD with 12 to 72 UTF-8 bytes before seeding.");
  const db = await getDatabase(); await ensureIndexes(db);
  const now = new Date(); const userCollection = db.collection<UserDocument>("users");
  const existingUser = await userCollection.findOne({ email, deletedAt: null });
  const user = existingUser ?? await userCollection.insertOne({ email, name: "Amani", passwordHash: await hash(password, 12), createdAt: now, updatedAt: now, deletedAt: null }).then(result => userCollection.findOne({ _id: result.insertedId }));
  if (!user?._id) throw new Error("Could not create the initial Personna account.");
  const userId = user._id;

  const settings: SettingsDocument = { userId, baseCurrency: "RWF", locale: "en-RW", timezone: "Africa/Kigali", activeProjectLimit: 5, weekStartsOn: 1, aiEnabled: false, aiContextScopes: { tasks: false, notes: false, finance: false, time: false }, createdAt: now, updatedAt: now, deletedAt: null };
  await db.collection<SettingsDocument>("settings").updateOne({ userId }, { $setOnInsert: settings }, { upsert: true });

  const goalsCollection = db.collection<GoalDocument>("goals");
  const goal = await ensure(goalsCollection, { userId, title: "Build a calm, capable personal system", deletedAt: null }, { _id: new ObjectId(), userId, title: "Build a calm, capable personal system", why: "Make room for meaningful work and a more balanced life.", area: "Personal", targetDate: null, status: "ACTIVE", createdAt: now, updatedAt: now, deletedAt: null });
  const healthGoal = await ensure(goalsCollection, { userId, title: "Protect energy and health", deletedAt: null }, { _id: new ObjectId(), userId, title: "Protect energy and health", why: "Create a steady foundation for focused work and life outside work.", area: "Health", targetDate: new Date(now.getFullYear(), now.getMonth() + 3, 1), status: "ACTIVE", createdAt: now, updatedAt: now, deletedAt: null });

  const projectsCollection = db.collection<ProjectDocument>("projects");
  const personnaProject = await ensure(projectsCollection, { userId, title: "Personna", deletedAt: null }, { _id: new ObjectId(), userId, title: "Personna", status: "ACTIVE", priority: "HIGH", deadline: null, goalId: goal._id, lastActivityAt: now, nextActionTaskId: null, createdAt: now, updatedAt: now, deletedAt: null });
  const learningProject = await ensure(projectsCollection, { userId, title: "French learning plan", deletedAt: null }, { _id: new ObjectId(), userId, title: "French learning plan", status: "ACTIVE", priority: "MEDIUM", deadline: null, goalId: healthGoal._id, lastActivityAt: new Date(now.getTime() - 2 * 86_400_000), nextActionTaskId: null, createdAt: now, updatedAt: now, deletedAt: null });
  await ensure(projectsCollection, { userId, title: "Home studio refresh", deletedAt: null }, { _id: new ObjectId(), userId, title: "Home studio refresh", status: "IDEA", priority: "LOW", deadline: null, goalId: null, lastActivityAt: now, nextActionTaskId: null, createdAt: now, updatedAt: now, deletedAt: null });

  const taskCollection = db.collection<TaskDocument>("tasks");
  const taskSeeds: { title: string; projectId: ObjectId | null; goalId: ObjectId | null; status: TaskDocument["status"]; priority: TaskDocument["priority"]; dueDays: number | null; top: boolean }[] = [
    { title: "Review the dashboard flow", projectId: personnaProject._id, goalId: goal._id, status: "TODO", priority: "HIGH", dueDays: 0, top: true },
    { title: "Plan the next French practice session", projectId: learningProject._id, goalId: healthGoal._id, status: "TODO", priority: "MEDIUM", dueDays: 1, top: true },
    { title: "Check the MongoDB seed data", projectId: personnaProject._id, goalId: goal._id, status: "TODO", priority: "MEDIUM", dueDays: 3, top: false },
    { title: "Capture a note from today", projectId: null, goalId: null, status: "INBOX", priority: "LOW", dueDays: null, top: false },
  ];
  for (const item of taskSeeds) {
    const dueDate = item.dueDays === null ? null : new Date(now.getTime() + item.dueDays * 86_400_000);
    await ensure(taskCollection, { userId, title: item.title, deletedAt: null }, { _id: new ObjectId(), userId, title: item.title, notes: "", status: item.status, priority: item.priority, dueDate, estimateMin: 30, projectId: item.projectId, goalId: item.goalId, isTop3Today: item.top, createdAt: now, updatedAt: now, deletedAt: null });
  }
  const nextAction = await taskCollection.findOne({ userId, title: "Review the dashboard flow", deletedAt: null });
  if (nextAction?._id) await projectsCollection.updateOne({ _id: personnaProject._id, userId, nextActionTaskId: null }, { $set: { nextActionTaskId: nextAction._id, updatedAt: now } });

  const categoryCollection = db.collection<CategoryDocument>("categories");
  const categorySeeds = [
    ["Groceries", "EXPENSE"], ["Transport", "EXPENSE"], ["Home", "EXPENSE"], ["Learning", "EXPENSE"], ["Health", "EXPENSE"], ["Salary", "INCOME"], ["Freelance", "INCOME"],
  ] as const;
  const categories = new Map<string, ObjectId>();
  for (const [name, kind] of categorySeeds) {
    const category = await ensure(categoryCollection, { userId, name, deletedAt: null }, { _id: new ObjectId(), userId, name, kind, color: "grauzone", createdAt: now, updatedAt: now, deletedAt: null });
    categories.set(name, category._id);
  }

  const accountCollection = db.collection<AccountDocument>("accounts");
  const momo = await ensure(accountCollection, { userId, name: "MTN Mobile Money", deletedAt: null }, { _id: new ObjectId(), userId, name: "MTN Mobile Money", type: "MOMO", currency: "RWF", openingBalanceMinor: 485_000, createdAt: now, updatedAt: now, deletedAt: null });
  const usdAccount = await ensure(accountCollection, { userId, name: "USD savings", deletedAt: null }, { _id: new ObjectId(), userId, name: "USD savings", type: "BANK", currency: "USD", openingBalanceMinor: 125_000, createdAt: now, updatedAt: now, deletedAt: null });

  const transactionCollection = db.collection<TransactionDocument>("transactions");
  const transactionSeeds: { key: string; accountId: ObjectId; type: "INCOME" | "EXPENSE"; amount: number; currency: "RWF" | "USD"; category: string; ago: number }[] = [
    { key: "Market groceries · sample", accountId: momo._id, type: "EXPENSE", amount: 18_500, currency: "RWF", category: "Groceries", ago: 1 },
    { key: "Local transport · sample", accountId: momo._id, type: "EXPENSE", amount: 3_000, currency: "RWF", category: "Transport", ago: 2 },
    { key: "Internet · sample", accountId: momo._id, type: "EXPENSE", amount: 25_000, currency: "RWF", category: "Home", ago: 4 },
    { key: "Monthly pay · sample", accountId: momo._id, type: "INCOME", amount: 780_000, currency: "RWF", category: "Salary", ago: 6 },
    { key: "Language app · sample", accountId: usdAccount._id, type: "EXPENSE", amount: 1_299, currency: "USD", category: "Learning", ago: 3 },
  ];
  for (const item of transactionSeeds) {
    const categoryId = categories.get(item.category)!;
    await ensure(transactionCollection, { userId, note: item.key, deletedAt: null }, { _id: new ObjectId(), userId, accountId: item.accountId, type: item.type, amountMinor: item.currency === "RWF" ? item.amount : item.amount, currency: item.currency, categoryId, occurredAt: new Date(now.getTime() - item.ago * 86_400_000), note: item.key, projectId: null, importHash: null, createdAt: now, updatedAt: now, deletedAt: null });
  }

  const month = localDateKey(now, "Africa/Kigali").slice(0, 7);
  const budgetCollection = db.collection<BudgetDocument>("budgets");
  for (const [categoryName, amountMinor] of [["Groceries", 180_000], ["Transport", 55_000], ["Learning", 80_000]] as const) {
    const categoryId = categories.get(categoryName)!;
    await budgetCollection.updateOne({ userId, month, categoryId }, { $setOnInsert: { _id: new ObjectId(), userId, month, categoryId, amountMinor, currency: "RWF", createdAt: now, updatedAt: now, deletedAt: null } }, { upsert: true });
  }
  const savingsCollection = db.collection<SavingsGoalDocument>("savingsGoals");
  await ensure(savingsCollection, { userId, name: "Emergency reserve", deletedAt: null }, { _id: new ObjectId(), userId, name: "Emergency reserve", targetMinor: 1_200_000, currentMinor: 340_000, currency: "RWF", deadline: new Date(now.getFullYear(), now.getMonth() + 9, 1), isEmergencyFund: true, createdAt: now, updatedAt: now, deletedAt: null });
  const debtCollection = db.collection<DebtDocument>("debts");
  await ensure(debtCollection, { userId, party: "Laptop installment · sample", deletedAt: null }, { _id: new ObjectId(), userId, direction: "OWED_BY_ME", party: "Laptop installment · sample", principalMinor: 240_000, balanceMinor: 95_000, currency: "RWF", dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15), createdAt: now, updatedAt: now, deletedAt: null });

  const notesCollection = db.collection<NoteDocument>("notes");
  await ensure(notesCollection, { userId, title: "A calmer start to the day", deletedAt: null }, { _id: new ObjectId(), userId, title: "A calmer start to the day", body: "Pick one meaningful task before opening messages. Leave space between commitments.", type: "NOTE", inbox: false, projectId: null, goalId: goal._id, tags: ["reflection", "routine"], createdAt: now, updatedAt: now, deletedAt: null });
  await ensure(notesCollection, { userId, title: "Ideas for Personna", deletedAt: null }, { _id: new ObjectId(), userId, title: "Ideas for Personna", body: "Keep daily capture fast and make the next action easy to find.", type: "IDEA", inbox: true, projectId: personnaProject._id, goalId: goal._id, tags: ["product"], createdAt: now, updatedAt: now, deletedAt: null });

  const habitCollection = db.collection<HabitDocument>("habits");
  const walkHabit = await ensure(habitCollection, { userId, name: "Take a walk", deletedAt: null }, { _id: new ObjectId(), userId, name: "Take a walk", cadence: "WEEKLY", targetPerWeek: 5, goalId: healthGoal._id, createdAt: now, updatedAt: now, deletedAt: null });
  const readHabit = await ensure(habitCollection, { userId, name: "Read for 20 minutes", deletedAt: null }, { _id: new ObjectId(), userId, name: "Read for 20 minutes", cadence: "DAILY", targetPerWeek: 7, goalId: healthGoal._id, createdAt: now, updatedAt: now, deletedAt: null });
  const today = localDateKey(now, "Africa/Kigali"); const yesterday = localDateKey(new Date(now.getTime() - 86_400_000), "Africa/Kigali");
  const logCollection = db.collection<HabitLogDocument>("habitLogs");
  for (const [habitId, date, status] of [[walkHabit._id, today, "DONE"], [readHabit._id, today, "DONE"], [walkHabit._id, yesterday, "DONE"], [readHabit._id, yesterday, "SKIPPED"]] as const) {
    await logCollection.updateOne({ userId, habitId, date }, { $setOnInsert: { _id: new ObjectId(), userId, habitId, date, status, note: "", createdAt: now, updatedAt: now, deletedAt: null } }, { upsert: true });
  }

  const learningCollection = db.collection<LearningItemDocument>("learningItems");
  await ensure(learningCollection, { userId, title: "French A2 conversation", deletedAt: null }, { _id: new ObjectId(), userId, title: "French A2 conversation", type: "COURSE", status: "IN_PROGRESS", progress: 42, goalId: healthGoal._id, createdAt: now, updatedAt: now, deletedAt: null });
  await ensure(learningCollection, { userId, title: "Deep Work", deletedAt: null }, { _id: new ObjectId(), userId, title: "Deep Work", type: "BOOK", status: "IN_PROGRESS", progress: 28, goalId: healthGoal._id, createdAt: now, updatedAt: now, deletedAt: null });

  const { start: todayStart } = zonedDayRange(now, "Africa/Kigali");
  const blocks = db.collection<TimeBlockDocument>("timeBlocks");
  for (const [title, hour, duration, category] of [["Focused work", 9, 90, "Deep work"], ["French practice", 16, 45, "Learning"]] as const) {
    const start = new Date(todayStart.getTime() + hour * 60 * 60_000);
    const end = new Date(start.getTime() + duration * 60_000);
    await blocks.updateOne({ userId, title, start, deletedAt: null }, { $setOnInsert: { _id: new ObjectId(), userId, title, start, end, taskId: null, projectId: title === "French practice" ? learningProject._id : personnaProject._id, category, createdAt: now, updatedAt: now, deletedAt: null } }, { upsert: true });
  }
  const entries = db.collection<TimeEntryDocument>("timeEntries");
  const focusStart = new Date(todayStart.getTime() + 9 * 60 * 60_000);
  const focusEnd = new Date(focusStart.getTime() + 45 * 60_000);
  await entries.updateOne({ userId, source: "TIMER", start: focusStart }, { $setOnInsert: { _id: new ObjectId(), userId, start: focusStart, end: focusEnd, taskId: null, projectId: personnaProject._id, source: "TIMER", createdAt: now, updatedAt: now, deletedAt: null } }, { upsert: true });

  const reviewCollection = db.collection<ReviewDocument>("reviews");
  const weekKey = localDateKey(now, "Africa/Kigali");
  await ensure(reviewCollection, { userId, type: "WEEKLY", period: weekKey, deletedAt: null }, { _id: new ObjectId(), userId, type: "WEEKLY", period: weekKey, wins: "Made room for focused work and a walk.", lessons: "A shorter task list made it easier to begin.", obstacles: "Too many small context switches.", nextFocus: "Protect two focused blocks and keep capture simple.", createdAt: now, updatedAt: now, deletedAt: null });
}

seed().then(() => console.log("Personna seed data is ready.")).catch((error: unknown) => { console.error("Personna seeding failed:", error); process.exitCode = 1; });
