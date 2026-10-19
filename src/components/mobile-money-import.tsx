"use client";

import { useActionState, useState } from "react";
import { CustomSelect } from "@/components/action-form";
import { parseMobileMoney } from "@/lib/finance/parse-momo";
import { importMobileMoneyAction } from "@/server/actions/core";
import { ActionToast } from "@/components/action-toast";

export function MobileMoneyImport({ accounts }: { accounts: { id: string; name: string }[] }) {
  const [raw, setRaw] = useState("");
  const [state, action, pending] = useActionState(async (_: { ok: boolean; error?: string } | null, data: FormData): Promise<{ ok: boolean; error?: string }> => {
    const result = await importMobileMoneyAction(data);
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }, null);
  const candidate = parseMobileMoney(raw);

  return <form action={action} className="space-y-3">
    <ActionToast result={state} successMessage="Transaction imported."/>
    <label className="block text-xs text-[var(--muted)]">Transaction message<textarea name="rawText" value={raw} onChange={event => setRaw(event.target.value)} maxLength={8000} required rows={5} className="form-control" placeholder="Paste a single MTN MoMo or Airtel Money message"/></label>
    <label className="block text-xs text-[var(--muted)]">RWF account<CustomSelect name="accountId" required>{accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</CustomSelect></label>
    {candidate && <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3" aria-live="polite"><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Review before saving</p><p className="mt-2 text-sm">{candidate.direction} · RWF {candidate.amountMinor.toLocaleString()}</p><p className="mt-1 text-xs text-[var(--muted)]">{candidate.counterparty ?? "Counterparty not detected"}{candidate.feeMinor !== null ? ` · Fee RWF ${candidate.feeMinor.toLocaleString()}` : ""}</p></div>}
    {state && !state.ok && <p role="alert" className="text-sm text-[var(--danger)]">{state.error}</p>}
    {state?.ok && <p role="status" className="text-sm text-[var(--success)]">Imported after review.</p>}
    <button disabled={!candidate || pending} className="rounded-lg bg-[var(--strawberry)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] disabled:opacity-50">{pending ? "Saving…" : "Confirm and import"}</button>
  </form>;
}
