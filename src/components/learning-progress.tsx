"use client";

import { useActionState } from "react";
import { updateLearningProgressAction } from "@/server/actions/core";
import { ActionToast } from "@/components/action-toast";

export function LearningProgress({ itemId, progress }: { itemId: string; progress: number }) {
  const action = updateLearningProgressAction.bind(null, itemId);
  const [state, formAction, pending] = useActionState(async (_: { ok: boolean; error?: string } | null, data: FormData) => action(Number(data.get("progress"))), null);

  return <form action={formAction} className="mt-3 flex items-center gap-3">
    <ActionToast result={state} successMessage="Learning progress updated."/>
    <label className="sr-only" htmlFor={`progress-${itemId}`}>Progress percentage</label>
    <input id={`progress-${itemId}`} name="progress" type="range" min="0" max="100" step="5" defaultValue={progress} className="min-w-0 flex-1 accent-[var(--strawberry)]" />
    <button disabled={pending} className="rounded-lg border border-[var(--border-strong)] px-2.5 py-1.5 text-xs text-[var(--tan)] disabled:opacity-50">{pending ? "Saving" : "Update"}</button>
    {state && !state.ok && <span role="alert" className="text-xs text-[var(--danger)]">{state.error}</span>}
  </form>;
}
