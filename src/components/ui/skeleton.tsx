export function TileSkeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-[20px] border border-[var(--border)] bg-[var(--surface-1)] p-5 ${className}`}><div className="h-3 w-24 rounded bg-[var(--surface-3)]"/><div className="mt-5 h-7 w-2/3 rounded bg-[var(--surface-3)]"/><div className="mt-5 h-2 w-full rounded-full bg-[var(--surface-3)]"/><div className="mt-3 h-3 w-1/2 rounded bg-[var(--surface-3)]"/></div>;
}

export function PageSkeleton() {
  return <div role="status" aria-label="Loading page" className="space-y-6"><span className="sr-only">Loading page</span><div><div className="h-8 w-48 animate-pulse rounded bg-[var(--surface-2)]"/><div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-[var(--surface-2)]"/></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><TileSkeleton/><TileSkeleton/><TileSkeleton/></div><TileSkeleton className="min-h-64"/></div>;
}
