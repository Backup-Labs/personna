"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeSlash, Envelope, LockKeyhole } from "@/components/ui/icons";
import { loginAction } from "./actions";

export function LoginForm({ error }: { error?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  return <form action={loginAction} className="login-form mt-5 space-y-4">
    <label className="block text-sm font-semibold text-[var(--tan)]">Email address
      <span className="relative mt-1.5 block"><Envelope size={16} className="login-field-icon"/><input required autoComplete="username" type="email" name="email" placeholder="you@example.com" className="form-control login-input h-12 text-sm placeholder:text-[var(--muted)]" /></span>
    </label>
    <label className="block text-sm font-semibold text-[var(--tan)]">Password
      <span className="relative mt-1.5 block"><LockKeyhole size={16} className="login-field-icon"/><input required autoComplete="current-password" type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" className="form-control login-input h-12 text-sm placeholder:text-[var(--muted)]"/><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--tan)]">{showPassword ? <EyeSlash size={16}/> : <Eye size={16}/>}</button></span>
    </label>
    {error === "invalid" && <p role="alert" className="rounded-md bg-[color-mix(in_srgb,var(--danger),transparent_90%)] px-3 py-2.5 text-sm text-[var(--danger)]">Email or password is incorrect, or sign-in is temporarily limited.</p>}
    <SubmitButton/>
  </form>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-disabled={pending} className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--strawberry)] text-sm font-bold text-[var(--ink)] shadow-[0_8px_22px_color-mix(in_srgb,var(--strawberry),transparent_84%)] transition-colors hover:bg-[#FF78A0] focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-80">
    {pending && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"/>}
    {pending ? "Signing in…" : "Sign in to Personna"}
  </button>;
}
