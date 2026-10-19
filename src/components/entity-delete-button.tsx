"use client";

import { useActionState } from "react";
import { Trash } from "@/components/ui/icons";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ActionToast } from "@/components/action-toast";

type DeleteAction = (id: string) => Promise<{ ok: boolean; error?: string }>;

export function EntityDeleteButton({ id, label, action }: { id: string; label: string; action: DeleteAction }) {
  const [state, formAction, pending] = useActionState(async () => action(id), null);
  return <form action={formAction} className="inline-flex items-center gap-2">
    <ActionToast result={state} successMessage={`${label} deleted.`}/>
    <ConfirmSubmitButton disabled={pending} title={`Delete this ${label.toLowerCase()}?`} description="This removes the record from your workspace. Related records are preserved where possible." confirmLabel={`Delete ${label.toLowerCase()}`} className="grid size-9 cursor-pointer place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--danger),transparent_90%)] hover:text-[var(--danger)] disabled:opacity-50"><Trash size={13}/></ConfirmSubmitButton>
    {state && !state.ok && <span role="alert" className="max-w-36 text-[10px] text-[var(--danger)]">{state.error}</span>}
  </form>;
}
