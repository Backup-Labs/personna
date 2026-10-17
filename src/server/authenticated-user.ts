import { ObjectId } from "mongodb";
import { auth } from "../../auth";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication is required to access personal data.");
    this.name = "AuthenticationRequiredError";
  }
}

export async function requireUserId(): Promise<ObjectId> {
  const session = await auth();
  const id = session?.user.id;
  if (!id || !ObjectId.isValid(id)) throw new AuthenticationRequiredError();
  return new ObjectId(id);
}
