"use client";

import { useActionState, useState } from "react";
import { CircleUserRound, Envelope, Eye, EyeSlash, LockKeyhole } from "@/components/ui/icons";
import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, initialState);
  return <form action={action} className="signup-form mt-5 space-y-3.5">
    <label className="block text-sm font-semibold text-[var(--tan)]">Your name
      <span className="relative mt-1.5 block"><CircleUserRound size={16} className="login-field-icon"/><input required autoComplete="name" maxLength={80} name="name" type="text" placeholder="How should we address you?" className="form-control login-input h-12 text-sm placeholder:text-[var(--muted)]"/></span>
    </label>
    <label className="block text-sm font-semibold text-[var(--tan)]">Email address
      <span className="relative mt-1.5 block"><Envelope size={16} className="login-field-icon"/><input required autoComplete="email" maxLength={254} name="email" type="email" placeholder="you@example.com" className="form-control login-input h-12 text-sm placeholder:text-[var(--muted)]"/></span>
    </label>
    <PasswordField name="password" label="Password" autoComplete="new-password" placeholder="At least 12 characters"/>
    <PasswordField name="confirmPassword" label="Confirm password" autoComplete="new-password" placeholder="Enter your password again"/>
    {state.error && <p role="alert" className="rounded-md bg-[color-mix(in_srgb,var(--danger),transparent_90%)] px-3 py-2.5 text-sm text-[var(--danger)]">{state.error}</p>}
    <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--strawberry)] text-sm font-bold text-[var(--ink)] transition-colors hover:bg-[#FF78A0] disabled:cursor-wait disabled:opacity-70">{pending ? "Creating your account…" : "Create your account"}</button>
    <p className="pt-1 text-center text-[11px] leading-5 text-[var(--muted)]">Use 12 or more characters. Your password is encrypted before it is stored.</p>
  </form>;
}

function PasswordField({ name, label, autoComplete, placeholder }: { name: string; label: string; autoComplete: string; placeholder: string }) {
  const [visible, setVisible] = useState(false);
  return <label className="block text-sm font-semibold text-[var(--tan)]">{label}
    <span className="relative mt-1.5 block"><LockKeyhole size={16} className="login-field-icon"/><input required autoComplete={autoComplete} minLength={12} maxLength={72} name={name} type={visible ? "text" : "password"} placeholder={placeholder} className="form-control login-input h-12 text-sm placeholder:text-[var(--muted)]"/><button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--tan)]">{visible ? <EyeSlash size={16}/> : <Eye size={16}/>}</button></span>
  </label>;
}
