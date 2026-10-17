import Link from "next/link";
import type { LucideIcon } from "@/components/ui/icons";

export function EmptyState({ icon: Icon, title, description, href, action }: { icon: LucideIcon; title: string; description: string; href?: string; action?: string }) {
  return <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-1)]/60 px-5 py-8 text-center"><span className="relative mx-auto grid size-11 place-items-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--strawberry)]"><Icon size={20}/></span><h3 className="relative mt-3 font-display text-base font-semibold">{title}</h3><p className="relative mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--muted)]">{description}</p>{href && action && <Link href={href} className="relative mt-4 inline-flex min-h-10 items-center rounded-xl bg-[var(--strawberry)] px-4 text-xs font-semibold text-[var(--ink)]">{action}</Link>}</div>;
}
