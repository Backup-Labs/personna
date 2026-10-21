"use client";

import { useActionState } from "react";
import { Trash } from "@/components/ui/icons";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ActionToast } from "@/components/action-toast";
import { deleteTimeBlockAction, deleteTimeEntryAction } from "@/server/actions/core";

export function TimeDeleteButton({ id, kind }: { id: string; kind: "block" | "entry" }) {
  const [state, action, pending] = useActionState(async () => kind === "block" ? deleteTimeBlockAction(id) : deleteTimeEntryAction(id), null);
  const label = kind === "block" ? "time block" : "time session";
  return <form action={action} className="inline-flex items-center gap-2">
    <ActionToast result={state} successMessage={`${kind === "block" ? "Time block" : "Time session"} deleted.`}/>
    <ConfirmSubmitButton disabled={pending} title={`Delete this ${label}?`} description="This removes it from your schedule and time reports." confirmLabel={`Delete ${label}`} className="icon-button flex size-9 cursor-pointer items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--danger),transparent_90%)] hover:text-[var(--danger)] disabled:opacity-50"><Trash size={13}/></ConfirmSubmitButton>
    {state && !state.ok && <span role="alert" className="text-[10px] text-[var(--danger)]">{state.error}</span>}
  </form>;
}
