"use client";

import { AlertTriangle, RotateCcw } from "@/components/ui/icons";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[var(--ink)] p-5 text-[var(--tan)]"><section className="w-full max-w-md rounded-[20px] border border-[var(--border-strong)] bg-[var(--surface-1)] p-7 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl border border-[var(--danger)]/40 text-[var(--danger)]"><AlertTriangle size={22}/></span><h1 className="mt-4 font-display text-xl font-semibold">This view could not load</h1><p className="mt-2 text-sm text-[var(--muted)]">Your data is safe. Try loading this page again.</p><button onClick={reset} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--strawberry)] px-4 text-sm font-semibold text-[var(--ink)]"><RotateCcw size={16}/>Try again</button></section></main>;
}
