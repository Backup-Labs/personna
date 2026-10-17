"use client";

import { useState } from "react";
import { Eye, EyeSlash, Envelope, LockKeyhole } from "@/components/ui/icons";
import { loginAction } from "./actions";

export function LoginForm({ error }: { error?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  return <form action={loginAction} className="mt-9 space-y-5">
    <label className="block text-sm font-semibold text-[var(--tan)]">Email address
      <span className="relative mt-2 block"><Envelope size={16} className="login-field-icon"/><input required autoComplete="username" type="email" name="email" placeholder="you@example.com" className="form-control login-input h-[52px] text-sm placeholder:text-[var(--muted)]" /></span>
    </label>
    <label className="block text-sm font-semibold text-[var(--tan)]">Password
      <span className="relative mt-2 block"><LockKeyhole size={16} className="login-field-icon"/><input required autoComplete="current-password" type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" className="form-control login-input h-[52px] text-sm placeholder:text-[var(--muted)]"/><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--tan)]">{showPassword ? <EyeSlash size={16}/> : <Eye size={16}/>}</button></span>
    </label>
    {error === "invalid" && <p role="alert" className="rounded-md bg-[color-mix(in_srgb,var(--danger),transparent_90%)] px-3 py-2.5 text-sm text-[var(--danger)]">Email or password is incorrect, or sign-in is temporarily limited.</p>}
    <button type="submit" className="group relative mt-2 inline-flex h-[52px] w-full items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(105deg,var(--strawberry),#D653B2_55%,#8C63FF)] text-sm font-bold text-[#17111D] shadow-[0_10px_30px_color-mix(in_srgb,var(--strawberry),transparent_75%)] transition hover:brightness-110 focus-visible:outline-offset-4"><span className="relative z-10">Sign in to Personna</span><span aria-hidden="true" className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100"/></button>
  </form>;
}
