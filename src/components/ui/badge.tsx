import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "accent";
const tones: Record<Tone, string> = {
  neutral: "border-[var(--border-strong)] text-[var(--muted)]",
  success: "border-[var(--success)]/35 bg-[color-mix(in_srgb,var(--success),transparent_94%)] text-[var(--success)]",
  warning: "border-[var(--warning)]/35 bg-[color-mix(in_srgb,var(--warning),transparent_94%)] text-[var(--warning)]",
  danger: "border-[var(--danger)]/35 bg-[color-mix(in_srgb,var(--danger),transparent_94%)] text-[var(--danger)]",
  accent: "border-[var(--strawberry)]/35 bg-[color-mix(in_srgb,var(--strawberry),transparent_94%)] text-[var(--strawberry)]",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium leading-none ${tones[tone]}`}>{children}</span>;
}
