"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { pricing } from "@/content/pricing";
import { getEnvironment } from "@/lib/env";
import { getDatabase } from "@/lib/db";
import type { WaitlistEntryDocument } from "@/server/db/collections";

const waitlistSchema = z.object({
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  businessType: z.enum(pricing.businessTypes),
});

type RateLimitDocument = { _id: string; count: number; expiresAt: Date };
type WaitlistResult = { ok: true } | { ok: false; error: string };

export async function joinBusinessWaitlistAction(_previous: WaitlistResult | null, form: FormData): Promise<WaitlistResult> {
  const parsed = waitlistSchema.safeParse({ email: form.get("email"), businessType: form.get("businessType") });
  if (!parsed.success) return { ok: false, error: "Enter a valid email and choose a business type." };

  try {
    const requestHeaders = await headers();
    const ip = requestHeaders.get("cf-connecting-ip") ?? requestHeaders.get("x-real-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const env = getEnvironment();
    const ipHash = createHmac("sha256", env.AUTH_SECRET).update(ip).digest("hex");
    const now = new Date();
    const bucket = Math.floor(now.getTime() / (15 * 60_000));
    const rateLimitId = `${ipHash}:${bucket}`;
    const db = await getDatabase();
    const limits = db.collection<RateLimitDocument>("waitlistRateLimits");

    try {
      await limits.updateOne({ _id: rateLimitId }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 1) * 15 * 60_000 + 60 * 60_000) } }, { upsert: true });
    } catch (error) {
      // Two first requests can race to upsert the same fixed-window bucket.
      if ((error as { code?: number }).code !== 11000) throw error;
      await limits.updateOne({ _id: rateLimitId }, { $inc: { count: 1 } });
    }
    const attempts = await limits.findOne({ _id: rateLimitId });
    if ((attempts?.count ?? 0) > 5) return { ok: false, error: "Too many requests. Please try again in a few minutes." };

    await db.collection<WaitlistEntryDocument>("waitlistEntries").updateOne(
      { email: parsed.data.email },
      { $setOnInsert: { ...parsed.data, createdAt: now } },
      { upsert: true },
    );
    return { ok: true };
  } catch {
    return { ok: false, error: "We could not add you right now. Please try again shortly." };
  }
}
