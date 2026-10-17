import type { ReactNode } from "react";

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <header className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-2"><div><h2 className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[var(--strawberry)]">{title}</h2>{description && <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>}</div>{action}</header>;
}
