"use client";

import { useActionState } from "react";
import { Trash } from "@/components/ui/icons";
import { deleteNoteAction } from "@/server/actions/core";

export function NoteDeleteButton({ noteId }: { noteId: string }) {
  const [state, action, pending] = useActionState(async () => deleteNoteAction(noteId), null);
  return (
    <form action={action} onSubmit={event => { if (!window.confirm("Delete this note? It will be removed from your notes and inbox.")) event.preventDefault(); }}>
      <button type="submit" disabled={pending} aria-label="Delete note" title="Delete note" className="grid size-9 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--danger),transparent_90%)] hover:text-[var(--danger)] disabled:opacity-50"><Trash size={14}/></button>
      {state && !state.ok && <span role="alert" className="text-[10px] text-[var(--danger)]">{state.error}</span>}
      {state?.ok && <span role="status" className="text-[10px] text-[var(--success)]">Deleted</span>}
    </form>
  );
}
