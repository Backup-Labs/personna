"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "../../../auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData): Promise<void> {
  try {
    formData.set("redirectTo", "/dashboard");
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?error=invalid");
    throw error;
  }
}

export async function signOutAction(): Promise<void> {
  "use server";
  await signOut({ redirectTo: "/login" });
}
