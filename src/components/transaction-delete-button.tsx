"use client";

import { useActionState } from "react";
import { Trash } from "@/components/ui/icons";
import { deleteTransactionAction } from "@/server/actions/core";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ActionToast } from "@/components/action-toast";

export function TransactionDeleteButton({ transactionId }: { transactionId: string }) {
  const [state, action, pending] = useActionState(async () => deleteTransactionAction(transactionId), null);
  return (
    <form action={action}>
      <ActionToast result={state} successMessage="Transaction deleted."/>
      <ConfirmSubmitButton disabled={pending} title="Delete this transaction?" description="Account balances and reports will be recalculated." confirmLabel="Delete transaction" className="grid size-8 cursor-pointer place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--danger),transparent_90%)] hover:text-[var(--danger)] disabled:opacity-50"><Trash size={13}/></ConfirmSubmitButton>
      {state && !state.ok && <span role="alert" className="text-[9px] text-[var(--danger)]">{state.error}</span>}
      {state?.ok && <span role="status" className="text-[9px] text-[var(--success)]">Deleted</span>}
    </form>
  );
}
