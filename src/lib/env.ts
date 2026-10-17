import { z } from "zod";

const environmentSchema = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().trim().min(1).max(63).default("personna"),
  AUTH_SECRET: z.string().min(32),
});

export function getEnvironment() {
  const result = environmentSchema.safeParse(process.env);
  if (!result.success) throw new Error(`Invalid Personna environment configuration: ${result.error.issues.map(issue => issue.path.join(".")).join(", ")}`);
  return result.data;
}
