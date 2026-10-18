"use client";

import { useActionState } from "react";
import { Trash } from "@/components/ui/icons";
import { deleteTransactionAction } from "@/server/actions/core";

export function TransactionDeleteButton({ transactionId }: { transactionId: string }) {
  const [state, action, pending] = useActionState(async () => deleteTransactionAction(transactionId), null);
  return (
    <form action={action} onSubmit={event => { if (!window.confirm("Delete this transaction? Account balances and reports will be recalculated.")) event.preventDefault(); }}>
      <button type="submit" disabled={pending} aria-label="Delete transaction" title="Delete transaction" className="grid size-8 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--danger),transparent_90%)] hover:text-[var(--danger)] disabled:opacity-50"><Trash size={13}/></button>
      {state && !state.ok && <span role="alert" className="text-[9px] text-[var(--danger)]">{state.error}</span>}
      {state?.ok && <span role="status" className="text-[9px] text-[var(--success)]">Deleted</span>}
    </form>
  );
}
