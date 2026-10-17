import type { ComponentType, ReactNode } from "react";

type CardVariant = "default" | "featured" | "inset" | "strawberry" | "eggplant" | "tan";

export function Card({ children, className = "", variant = "default", id }: { children: ReactNode; className?: string; variant?: CardVariant; id?: string }) {
  const variants: Record<CardVariant, string> = {
    default: "border-[var(--border-strong)] bg-[var(--surface-1)]",
    featured: "surface-featured border-[var(--border)] bg-[var(--surface-1)]",
    inset: "border-[var(--border)] bg-[var(--ink)]",
    strawberry: "border-[var(--strawberry)]/30 bg-[color-mix(in_srgb,var(--strawberry),var(--surface-1)_92%)]",
    eggplant: "border-[var(--eggplant)]/50 bg-[color-mix(in_srgb,var(--eggplant),var(--surface-1)_65%)]",
    tan: "border-[var(--tan)]/25 bg-[color-mix(in_srgb,var(--tan),var(--surface-1)_94%)]",
  };
  return <section id={id} className={`surface rounded-[20px] border p-5 sm:p-6 ${variants[variant]} ${className}`}>{children}</section>;
}

export function CardHeader({ title, subtitle, action, icon: Icon }: { title: string; subtitle?: string; action?: ReactNode; icon?: ComponentType<{ size?: number; className?: string }> }) {
  return <header className="mb-4 flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3">{Icon && <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--strawberry)]"><Icon size={18}/></span>}<div className="min-w-0"><h2 className="font-display text-lg font-semibold leading-tight">{title}</h2>{subtitle && <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{subtitle}</p>}</div></div>{action}</header>;
}

export function CardFooter({ href, children = "View all" }: { href: string; children?: ReactNode }) {
  return <a href={href} className="mt-4 inline-flex min-h-10 items-center gap-2 border-t border-[var(--border)] pt-3 text-xs font-semibold text-[var(--strawberry)] hover:text-[var(--tan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strawberry)]">{children}<span aria-hidden="true">→</span></a>;
}
