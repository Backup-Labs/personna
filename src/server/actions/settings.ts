"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import type { SettingsDocument } from "@/server/db/collections";

export async function updateSettingsAction(form: FormData) {
  const parsed = z.object({ baseCurrency: z.enum(["RWF", "USD"]), locale: z.string().trim().min(2).max(20), timezone: z.string().trim().min(3).max(80), activeProjectLimit: z.coerce.number().int().min(1).max(50), aiEnabled: z.enum(["true", "false"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: "Check your settings and try again." };
  try { new Intl.DateTimeFormat(parsed.data.locale, { timeZone: parsed.data.timezone }); const userId = await requireUserId(); const db = await getDatabase(); const now = new Date(); const values = { ...parsed.data, aiEnabled: parsed.data.aiEnabled === "true", updatedAt: now }; await db.collection<SettingsDocument>("settings").updateOne({ userId, deletedAt: null }, { $set: values, $setOnInsert: { userId, weekStartsOn: 1, aiContextScopes: { tasks: false, notes: false, finance: false, time: false }, createdAt: now, deletedAt: null } }, { upsert: true }); revalidatePath("/settings"); revalidatePath("/"); return { ok: true }; } catch { return { ok: false, error: "Unable to save settings. Check that your locale and timezone are valid." }; }
}
