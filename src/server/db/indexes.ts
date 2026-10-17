import type { Db, IndexDescription } from "mongodb";

const indexes: Record<string, IndexDescription[]> = {
  users: [{ key: { email: 1 }, unique: true, name: "email_unique" }],
  settings: [{ key: { userId: 1 }, unique: true, name: "user_settings_unique" }],
  tasks: [
    { key: { userId: 1, status: 1, dueDate: 1 }, name: "user_task_board_due" },
    { key: { userId: 1, isTop3Today: 1, status: 1 }, name: "user_today_top3" },
    { key: { userId: 1, projectId: 1 }, name: "user_project_tasks" },
  ],
  projects: [{ key: { userId: 1, status: 1, lastActivityAt: -1 }, name: "user_project_status_activity" }],
  goals: [{ key: { userId: 1, status: 1, targetDate: 1 }, name: "user_goal_status_target" }],
  notes: [
    { key: { userId: 1, inbox: 1, updatedAt: -1 }, name: "user_note_inbox_updated" },
    { key: { userId: 1, title: "text", body: "text", tags: "text" }, name: "user_note_search" },
  ],
  timeBlocks: [{ key: { userId: 1, start: 1, end: 1 }, name: "user_time_blocks" }],
  timeEntries: [
    { key: { userId: 1, start: -1 }, name: "user_time_entries" },
    { key: { userId: 1 }, unique: true, partialFilterExpression: { end: null, deletedAt: null }, name: "one_running_timer_per_user" },
  ],
  accounts: [{ key: { userId: 1, name: 1 }, unique: true, name: "user_account_name" }],
  categories: [{ key: { userId: 1, kind: 1, name: 1 }, unique: true, name: "user_category_name" }],
  transactions: [
    { key: { userId: 1, occurredAt: -1 }, name: "user_transaction_date" },
    { key: { userId: 1, importHash: 1 }, unique: true, partialFilterExpression: { importHash: { $type: "string" } }, name: "user_transaction_import_dedupe" },
  ],
  budgets: [{ key: { userId: 1, month: 1, categoryId: 1 }, unique: true, name: "user_month_category_budget" }],
  savingsGoals: [{ key: { userId: 1, deletedAt: 1 }, name: "user_savings_goals" }],
  debts: [{ key: { userId: 1, direction: 1, dueDate: 1 }, name: "user_debts_due" }],
  habits: [{ key: { userId: 1, name: 1 }, name: "user_habit_name" }],
  habitLogs: [{ key: { userId: 1, habitId: 1, date: 1 }, unique: true, name: "user_habit_log_day" }],
  learningItems: [{ key: { userId: 1, status: 1, updatedAt: -1 }, name: "user_learning_status" }],
  reviews: [{ key: { userId: 1, type: 1, period: 1 }, unique: true, name: "user_review_period" }],
  authAttempts: [{ key: { expiresAt: 1 }, expireAfterSeconds: 0, name: "auth_attempts_ttl" }],
};

export async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all(
    Object.entries(indexes).map(([collection, definitions]) =>
      db.collection(collection).createIndexes(definitions),
    ),
  );
}
