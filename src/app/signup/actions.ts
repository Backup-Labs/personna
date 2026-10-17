"use server";

import { hash } from "bcryptjs";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/lib/db";
import type { SettingsDocument, UserDocument } from "@/server/db/collections";

export type SignupState = { error?: string };

const signupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(72).refine(value => Buffer.byteLength(value, "utf8") <= 72),
  confirmPassword: z.string().max(72),
}).refine(values => values.password === values.confirmPassword, { path: ["confirmPassword"] });

const WINDOW_MS = 60 * 60 * 1000;
const MAX_SIGNUPS_PER_WINDOW = 5;

export async function signupAction(_previousState: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const passwordMismatch = parsed.error.issues.some(issue => issue.path[0] === "confirmPassword");
    return { error: passwordMismatch ? "Your passwords do not match." : "Enter a name, a valid email, and a password with at least 12 characters." };
  }

  const db = await getDatabase();
  const users = db.collection<UserDocument>("users");
  await users.createIndex({ email: 1 }, { unique: true, name: "email_unique" });
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-real-ip")?.trim() || requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ipKey = createHash("sha256").update(ip).digest("hex");
  const bucket = Math.floor(Date.now() / WINDOW_MS);
  const rateLimitId = `signup:${ipKey}:${bucket}`;
  const expiresAt = new Date((bucket + 1) * WINDOW_MS);
  const rateLimits = db.collection<{ _id: string; attempts: number; expiresAt: Date }>("authAttempts");
  await rateLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "auth_attempts_ttl" });
  try {
    await rateLimits.updateOne({ _id: rateLimitId }, { $inc: { attempts: 1 }, $setOnInsert: { expiresAt } }, { upsert: true });
  } catch (error) {
    if (!(typeof error === "object" && error !== null && "code" in error && error.code === 11000)) throw error;
    await rateLimits.updateOne({ _id: rateLimitId }, { $inc: { attempts: 1 } });
  }
  const rateLimit = await rateLimits.findOne({ _id: rateLimitId }, { projection: { attempts: 1 } });
  if ((rateLimit?.attempts ?? 0) > MAX_SIGNUPS_PER_WINDOW) {
    return { error: "Account creation is temporarily limited. Please try again later." };
  }

  const email = parsed.data.email.toLowerCase();
  const now = new Date();
  try {
    const user = await users.insertOne({
      email,
      name: parsed.data.name,
      passwordHash: await hash(parsed.data.password, 12),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
    const settings: SettingsDocument = {
      userId: user.insertedId,
      baseCurrency: "RWF",
      locale: "en-RW",
      timezone: "Africa/Kigali",
      activeProjectLimit: 5,
      weekStartsOn: 1,
      aiEnabled: false,
      aiContextScopes: { tasks: false, notes: false, finance: false, time: false },
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    try {
      await db.collection<SettingsDocument>("settings").insertOne(settings);
    } catch (error) {
      await users.deleteOne({ _id: user.insertedId });
      throw error;
    }
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return { error: "We couldn't create an account with those details. Check them and try again." };
    }
    throw error;
  }

  redirect("/login?registered=1");
}
