type WeeklyPoint = { label: string; value: number };

export function WeeklyBars({ title, description, points, valueLabel = "minutes" }: { title: string; description: string; points: WeeklyPoint[]; valueLabel?: string }) {
  const maximum = Math.max(1, ...points.map(point => point.value));
  return <section aria-label={title} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
    <div className="mb-4"><h2 className="font-display text-base font-semibold">{title}</h2><p className="mt-1 text-xs text-[var(--muted)]">{description}</p></div>
    <div className="grid h-36 grid-cols-7 items-end gap-2" role="img" aria-label={`${title}: ${points.map(point => `${point.label} ${point.value} ${valueLabel}`).join(", ")}`}>
      {points.map(point => <div key={point.label} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
        <span className="metric-number text-[9px] tabular-nums text-[var(--muted)]">{new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(point.value)}</span>
        <div className="flex h-24 w-full items-end"><span className="w-full rounded-t-sm bg-[var(--strawberry)]/80 transition-[height]" style={{ height: `${Math.max(point.value > 0 ? 6 : 2, point.value / maximum * 100)}%` }} /></div>
        <span className="text-[9px] text-[var(--muted)]">{point.label}</span>
      </div>)}
    </div>
  </section>;
}
