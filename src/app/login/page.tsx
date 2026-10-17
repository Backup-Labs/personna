import { LockKeyhole, Sparkles } from "@/components/ui/icons";
import { loginAction } from "./actions";

export const metadata = { title: "Sign in · Personna" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="grain relative grid min-h-screen place-items-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute -top-44 left-1/2 size-[420px] -translate-x-1/2 rounded-full opacity-30 blur-3xl" style={{ background: "var(--grad-glow)" }} />
      <section className="relative w-full max-w-[410px] rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-7 shadow-2xl sm:p-9">
        <div className="mb-9 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--strawberry)]"><Sparkles size={18} /></span><span className="font-display text-lg font-semibold">personna<span className="text-[var(--strawberry)]">.</span></span></div>
        <span className="mb-5 grid size-10 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--grauzone)]"><LockKeyhole size={17} /></span>
        <h1 className="font-display text-2xl font-medium">Welcome back</h1>
        <p className="mt-2 text-sm text-[var(--grauzone)]">Sign in to your private workspace.</p>
        <form action={loginAction} className="mt-7 space-y-4">
          <label className="block text-xs text-[var(--grauzone)]">Email<input required autoComplete="username" type="email" name="email" className="mt-2 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--ink)] px-3 text-sm text-[var(--tan)] outline-none transition focus:border-[var(--strawberry)]" /></label>
          <label className="block text-xs text-[var(--grauzone)]">Password<input required autoComplete="current-password" type="password" name="password" className="mt-2 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--ink)] px-3 text-sm text-[var(--tan)] outline-none transition focus:border-[var(--strawberry)]" /></label>
          {error === "invalid" && <p role="alert" className="text-xs text-[var(--danger)]">Email or password is incorrect, or sign-in is temporarily limited.</p>}
          <button type="submit" className="mt-2 h-11 w-full rounded-xl bg-[var(--strawberry)] text-sm font-semibold text-[var(--ink)] transition hover:shadow-[0_0_24px_#FF5C8D55]">Sign in</button>
        </form>
        <p className="mt-6 text-center text-[10px] text-[var(--grauzone)]">One system. Every responsibility. Meaningful progress.</p>
      </section>
    </main>
  );
}
