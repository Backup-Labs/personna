import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { createHash } from "node:crypto";
import { z } from "zod";
import authConfig from "./auth.config";
import { getDatabase } from "@/lib/db";
import type { UserDocument } from "@/server/db/collections";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72).refine(value => Buffer.byteLength(value, "utf8") <= 72),
});

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 10;
let dummyPasswordHash: Promise<string> | undefined;

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const db = await getDatabase();
        const now = Date.now();
        const bucket = Math.floor(now / ATTEMPT_WINDOW_MS);
        const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        const clientIp = request.headers.get("x-real-ip")?.trim() || forwarded || "local";
        const clientKey = createHash("sha256").update(clientIp).digest("hex");
        const rateLimitId = `credentials:${clientKey}:${bucket}`;
        const rateLimits = db.collection<{ _id: string; attempts: number; expiresAt: Date }>("authAttempts");
        const [rateLimit, user] = await Promise.all([
          rateLimits.findOneAndUpdate(
            { _id: rateLimitId },
            { $inc: { attempts: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 1) * ATTEMPT_WINDOW_MS) } },
            { upsert: true, returnDocument: "after", projection: { attempts: 1 } },
          ),
          db.collection<UserDocument>("users").findOne({ email: parsed.data.email.toLowerCase(), deletedAt: null }),
        ]);
        if (!rateLimit || rateLimit.attempts > MAX_ATTEMPTS_PER_WINDOW) return null;

        const passwordHash = user?.passwordHash ?? await (dummyPasswordHash ??= hash("personna-credential-check", 12));
        const passwordMatches = await compare(parsed.data.password, passwordHash);
        if (!user?._id || !user.passwordHash || !passwordMatches) return null;

        return { id: user._id.toHexString(), name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = typeof token.userId === "string" ? token.userId : token.sub ?? "";
      return session;
    },
  },
});
