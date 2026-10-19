"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import type { SettingsDocument, UserDocument } from "@/server/db/collections";

const passwordSchema = z.string().min(12).max(72).refine(value => Buffer.byteLength(value, "utf8") <= 72);

function formValue(form: FormData, key: string): unknown {
  return form.get(key);
}

export async function updateProfileAction(form: FormData) {
  const parsed = z.object({ name: z.string().trim().min(1).max(80) }).safeParse({ name: formValue(form, "name") });
  if (!parsed.success) return { ok: false, error: "Enter a name between 1 and 80 characters." };

  try {
    const userId = await requireUserId();
    const result = await (await getDatabase()).collection<UserDocument>("users").updateOne(
      { _id: userId, deletedAt: null },
      { $set: { name: parsed.data.name, updatedAt: new Date() } },
    );
    if (!result.matchedCount) return { ok: false, error: "Your account could not be found. Sign in again and retry." };
    revalidatePath("/settings");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to update your profile right now." };
  }
}

export async function changePasswordAction(form: FormData) {
  const parsed = z.object({
    currentPassword: z.string().min(1).max(72).refine(value => Buffer.byteLength(value, "utf8") <= 72),
    newPassword: passwordSchema,
    confirmPassword: z.string().max(72),
  }).refine(value => value.newPassword === value.confirmPassword, { path: ["confirmPassword"] })
    .safeParse({ currentPassword: formValue(form, "currentPassword"), newPassword: formValue(form, "newPassword"), confirmPassword: formValue(form, "confirmPassword") });
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some(issue => issue.path[0] === "confirmPassword");
    return { ok: false, error: mismatch ? "The new passwords do not match." : "Use a new password with at least 12 characters." };
  }

  try {
    const userId = await requireUserId();
    const users = (await getDatabase()).collection<UserDocument>("users");
    const user = await users.findOne({ _id: userId, deletedAt: null }, { projection: { passwordHash: 1 } });
    if (!user?.passwordHash || !(await compare(parsed.data.currentPassword, user.passwordHash))) {
      return { ok: false, error: "Your current password is incorrect." };
    }
    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return { ok: false, error: "Choose a new password that differs from your current password." };
    }
    const passwordHash = await hash(parsed.data.newPassword, 12);
    const changed = await users.updateOne({ _id: userId, deletedAt: null, passwordHash: user.passwordHash }, { $set: { passwordHash, updatedAt: new Date() } });
    if (!changed.modifiedCount) return { ok: false, error: "Your password changed in another request. Sign in again and retry." };
    revalidatePath("/settings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to change your password right now. Please try again." };
  }
}

export async function updateSettingsAction(form: FormData) {
  const parsed = z.object({
    baseCurrency: z.enum(["RWF", "USD"]),
    locale: z.string().trim().min(2).max(20),
    timezone: z.string().trim().min(3).max(80),
    activeProjectLimit: z.coerce.number().int().min(1).max(50),
    weekStartsOn: z.enum(["0", "1"]),
  }).safeParse({
    baseCurrency: formValue(form, "baseCurrency"),
    locale: formValue(form, "locale"),
    timezone: formValue(form, "timezone"),
    activeProjectLimit: formValue(form, "activeProjectLimit"),
    weekStartsOn: formValue(form, "weekStartsOn"),
  });
  if (!parsed.success) return { ok: false, error: "Check your preferences and try again." };

  try {
    new Intl.DateTimeFormat(parsed.data.locale, { timeZone: parsed.data.timezone });
    const userId = await requireUserId();
    const db = await getDatabase();
    const now = new Date();
    await db.collection<SettingsDocument>("settings").updateOne(
      { userId, deletedAt: null },
      {
        $set: {
          baseCurrency: parsed.data.baseCurrency,
          locale: parsed.data.locale,
          timezone: parsed.data.timezone,
          activeProjectLimit: parsed.data.activeProjectLimit,
          weekStartsOn: Number(parsed.data.weekStartsOn) as 0 | 1,
          updatedAt: now,
        },
        $setOnInsert: {
          userId,
          aiEnabled: false,
          aiContextScopes: { tasks: false, notes: false, finance: false, time: false },
          createdAt: now,
          deletedAt: null,
        },
      },
      { upsert: true },
    );
    revalidatePath("/settings");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/growth");
    revalidatePath("/time");
    revalidatePath("/finance");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to save settings. Check that your locale and timezone are valid." };
  }
}
