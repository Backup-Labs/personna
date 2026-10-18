import { ObjectId } from "mongodb";
import type { Session } from "next-auth";
import { auth } from "../../auth";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication is required to access personal data.");
    this.name = "AuthenticationRequiredError";
  }
}

export async function requireUserId(existingSession?: Session | null): Promise<ObjectId> {
  const session = existingSession === undefined ? await auth() : existingSession;
  const id = session?.user.id;
  if (!id || !ObjectId.isValid(id)) throw new AuthenticationRequiredError();
  return new ObjectId(id);
}
