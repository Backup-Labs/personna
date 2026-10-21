"use client";

import { useActionState } from "react";
import { Trash } from "@/components/ui/icons";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ActionToast } from "@/components/action-toast";

type DeleteAction = (id: string) => Promise<{ ok: boolean; error?: string }>;

export function EntityDeleteButton({ id, label, action, description }: { id: string; label: string; action: DeleteAction; description?: string }) {
  const [state, formAction, pending] = useActionState(async () => action(id), null);
  const defaultDesc = label.toLowerCase() === "account"
    ? "Deleting this account will permanently remove it and automatically cascade to delete all of its transactions."
    : "This removes the record from your workspace. Related records are preserved where possible.";

  return <form action={formAction} className="inline-flex items-center">
    <ActionToast result={state} successMessage={`${label} deleted.`}/>
    <ConfirmSubmitButton
      disabled={pending}
      title={`Delete this ${label.toLowerCase()}?`}
      description={description ?? defaultDesc}
      confirmLabel={`Delete ${label.toLowerCase()}`}
      className="icon-button flex size-9 cursor-pointer items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--danger),transparent_90%)] hover:text-[var(--danger)] disabled:opacity-50"
    >
      <Trash size={13}/>
    </ConfirmSubmitButton>
  </form>;
}
