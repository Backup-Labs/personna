"use client";

import { useActionState } from "react";
import { Trash } from "@/components/ui/icons";
import { deleteNoteAction } from "@/server/actions/core";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ActionToast } from "@/components/action-toast";

export function NoteDeleteButton({ noteId }: { noteId: string }) {
  const [state, action, pending] = useActionState(async () => deleteNoteAction(noteId), null);
  return (
    <form action={action}>
      <ActionToast result={state} successMessage="Note deleted."/>
      <ConfirmSubmitButton disabled={pending} title="Delete this note?" description="It will be removed from your notes and inbox." confirmLabel="Delete note" className="icon-button flex size-9 cursor-pointer items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--danger),transparent_90%)] hover:text-[var(--danger)] disabled:opacity-50"><Trash size={14}/></ConfirmSubmitButton>
      {state && !state.ok && <span role="alert" className="text-[10px] text-[var(--danger)]">{state.error}</span>}
      {state?.ok && <span role="status" className="text-[10px] text-[var(--success)]">Deleted</span>}
    </form>
  );
}
