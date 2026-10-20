"use client";

import { useActionState } from "react";
import { CustomSelect } from "@/components/action-form";
import { pricing } from "@/content/pricing";
import { joinBusinessWaitlistAction } from "@/server/actions/waitlist";
import { trackLandingEvent } from "./analytics";

export function BusinessWaitlistForm() {
  const [state, action, pending] = useActionState(joinBusinessWaitlistAction, null);
  return <form id="business-waitlist" action={action} onSubmit={() => trackLandingEvent("waitlist_submit")} className="landing-waitlist-form">
    <div><label htmlFor="business-waitlist-email">Email</label><input id="business-waitlist-email" className="form-control" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com"/></div>
    <div><label className="block text-[10px] text-[var(--landing-muted)]">Business type</label><CustomSelect name="businessType" ariaLabel="Business type" required><option value="">Choose a type</option>{pricing.businessTypes.map(type => <option key={type} value={type}>{type}</option>)}</CustomSelect></div>
    <button className="landing-button landing-button-primary" type="submit" disabled={pending}>{pending ? "Joining…" : "Join the waitlist"}</button>
    {state?.ok && <p role="status" className="landing-waitlist-status">You’re on the list. We’ll be in touch when Business is ready.</p>}
    {state && !state.ok && <p role="alert" className="landing-waitlist-error">{state.error}</p>}
  </form>;
}
