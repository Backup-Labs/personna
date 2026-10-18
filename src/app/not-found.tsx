import Link from "next/link";
import { ArrowLeft, CircleAlert } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--ink)] px-5 py-16 text-[var(--tan)]">
      <section className="w-full max-w-lg text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--surface-2)] text-[var(--strawberry)]">
          <CircleAlert size={24} />
        </span>
        <p className="mt-6 font-mono text-xs tracking-[0.2em] text-[var(--strawberry)]">404 · NOT FOUND</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">This page isn’t here.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
          The link may be old, or the page may have moved. Head back to your workspace and continue from there.
        </p>
        <Link href="/dashboard" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--strawberry)] px-4 text-sm font-semibold text-[var(--ink)]">
          <ArrowLeft size={15} /> Go to dashboard
        </Link>
      </section>
    </main>
  );
}
