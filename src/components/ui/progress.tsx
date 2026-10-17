import type { CSSProperties } from "react";

export function ProgressBar({ value, max = 100, label, detail, variant = "default", hero = false }: { value: number; max?: number; label?: string; detail?: string; variant?: "default" | "success" | "warning" | "danger"; hero?: boolean }) {
  const percent = Math.min(100, Math.max(0, max <= 0 ? 0 : value / max * 100));
  const color = variant === "success" ? "var(--success)" : variant === "warning" ? "var(--warning)" : variant === "danger" ? "var(--danger)" : "var(--grad-bar)";
  return <div className="w-full">{(label || detail) && <div className="mb-2 flex items-baseline justify-between gap-3 text-xs"><span className="truncate text-[var(--muted)]">{label}</span><span className="shrink-0 font-mono tabular-nums text-[var(--tan)]">{detail ?? `${Math.round(percent)}%`}</span></div>}<div role="progressbar" aria-label={label ?? "Progress"} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(max, Math.max(0, value))} className={`progress-track ${hero ? "h-3" : "h-2"}`}><span className="progress-fill" style={{ "--progress-width": `${percent}%`, "--progress-fill": color } as CSSProperties}/></div></div>;
}

export function ProgressRing({ value, size = 72, label }: { value: number; size?: number; label: string }) {
  const percent = Math.min(100, Math.max(0, value));
  return <div className="progress-ring" role="img" aria-label={`${label}: ${Math.round(percent)} percent`} style={{ "--progress": `${percent}%`, width: size, height: size } as CSSProperties}><span>{Math.round(percent)}<small>%</small></span></div>;
}
