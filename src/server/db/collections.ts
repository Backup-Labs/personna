import type { ObjectId } from "mongodb";

export type UserDocument = {
  _id?: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type SettingsDocument = {
  _id?: ObjectId;
  userId: ObjectId;
  baseCurrency: "RWF" | "USD";
  locale: string;
  timezone: string;
  activeProjectLimit: number;
  weekStartsOn: 0 | 1;
  aiEnabled: boolean;
  aiContextScopes: { tasks: boolean; notes: boolean; finance: boolean; time: boolean };
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type TaskDocument = {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  notes: string;
  status: "INBOX" | "TODO" | "DOING" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | null;
  estimateMin: number | null;
  projectId: ObjectId | null;
  goalId: ObjectId | null;
  isTop3Today: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ProjectDocument = {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  status: "IDEA" | "PLANNED" | "ACTIVE" | "PAUSED" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date | null;
  goalId: ObjectId | null;
  lastActivityAt: Date | null;
  nextActionTaskId: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type GoalDocument = {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  why: string;
  area: string;
  targetDate: Date | null;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type NoteDocument = {
  _id?: ObjectId; userId: ObjectId; title: string; body: string;
  type: "NOTE" | "IDEA" | "DECISION" | "MEETING" | "LINK"; inbox: boolean;
  projectId: ObjectId | null; goalId: ObjectId | null; tags: string[];
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type TimeBlockDocument = {
  _id?: ObjectId; userId: ObjectId; title: string; start: Date; end: Date;
  taskId: ObjectId | null; projectId: ObjectId | null; category: string;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type TimeEntryDocument = {
  _id?: ObjectId; userId: ObjectId; start: Date; end: Date | null;
  taskId: ObjectId | null; projectId: ObjectId | null; source: "TIMER" | "MANUAL";
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type AccountDocument = {
  _id?: ObjectId; userId: ObjectId; name: string; type: "CASH" | "MOMO" | "BANK" | "CARD" | "OTHER";
  currency: "RWF" | "USD"; openingBalanceMinor: number;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type CategoryDocument = {
  _id?: ObjectId; userId: ObjectId; name: string; kind: "INCOME" | "EXPENSE";
  color: string; createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type TransactionDocument = {
  _id?: ObjectId; userId: ObjectId; accountId: ObjectId; type: "INCOME" | "EXPENSE" | "TRANSFER";
  amountMinor: number; currency: "RWF" | "USD"; categoryId: ObjectId | null;
  occurredAt: Date; note: string; projectId: ObjectId | null; importHash: string | null;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type BudgetDocument = {
  _id?: ObjectId; userId: ObjectId; categoryId: ObjectId; month: string;
  amountMinor: number; currency: "RWF" | "USD";
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type SavingsGoalDocument = {
  _id?: ObjectId; userId: ObjectId; name: string; targetMinor: number;
  currentMinor: number; currency: "RWF" | "USD"; deadline: Date | null; isEmergencyFund: boolean;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type DebtDocument = {
  _id?: ObjectId; userId: ObjectId; direction: "OWED_BY_ME" | "OWED_TO_ME";
  party: string; principalMinor: number; balanceMinor: number; currency: "RWF" | "USD"; dueDate: Date | null;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type HabitDocument = {
  _id?: ObjectId; userId: ObjectId; name: string; cadence: "DAILY" | "WEEKLY";
  targetPerWeek: number; goalId: ObjectId | null;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type HabitLogDocument = {
  _id?: ObjectId; userId: ObjectId; habitId: ObjectId; date: string;
  status: "DONE" | "SKIPPED" | "MISSED"; note: string;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type LearningItemDocument = {
  _id?: ObjectId; userId: ObjectId; title: string; type: "COURSE" | "BOOK" | "VIDEO" | "ARTICLE" | "SUBJECT";
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED"; progress: number; goalId: ObjectId | null;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};

export type ReviewDocument = {
  _id?: ObjectId; userId: ObjectId; type: "DAILY" | "WEEKLY" | "MONTHLY";
  period: string; wins: string; lessons: string; obstacles: string; nextFocus: string;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
};
