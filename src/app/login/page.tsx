import { Activity, ArrowUpRight, CircleCheck, Sparkles } from "@/components/ui/icons";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in · Personna" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; registered?: string }> }) {
  const { error, registered } = await searchParams;
  return <main className="login-shell grain relative isolate h-dvh overflow-hidden">
    <div aria-hidden="true" className="pointer-events-none absolute -left-44 top-[20%] size-[480px] rounded-full bg-[var(--strawberry)]/10 blur-[120px]"/>
    <div className="login-layout mx-auto grid h-full w-full max-w-[1920px] lg:grid-cols-[minmax(390px,.88fr)_minmax(0,1.12fr)]">
      <section className="login-column relative z-10 flex h-full min-h-0 flex-col justify-between px-6 py-5 sm:px-10 lg:px-8 xl:px-14">
        <a href="/login" aria-label="Personna sign in" className="inline-flex w-fit items-center gap-3 text-[var(--tan)]"><span className="grid size-9 place-items-center rounded-lg bg-[var(--surface-2)] text-[var(--strawberry)]"><Sparkles size={17}/></span><span className="text-xl font-extrabold tracking-[-.04em]">personna<span className="text-[var(--strawberry)]">.</span></span></a>
        <div className="login-content mx-auto w-full max-w-[420px] py-4">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/[.045] px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#D7B7F4]"><span className="size-1.5 rounded-full bg-[var(--strawberry)] shadow-[0_0_10px_var(--strawberry)]"/> YOUR PERSONAL OPERATING SYSTEM</div>
          <h1 className="max-w-[10ch] text-[38px] font-extrabold leading-[1.03] tracking-[-.06em] text-white sm:text-[44px]">Welcome back<span className="text-[var(--strawberry)]">.</span></h1>
          <p className="login-description mt-2 max-w-sm text-sm leading-6 text-[color-mix(in_srgb,var(--tan),transparent_24%)]">A little clarity goes a long way. Sign in to pick up where you left off.</p>
          {registered === "1" && <p role="status" className="mt-4 rounded-md bg-[color-mix(in_srgb,var(--success),transparent_90%)] px-3 py-2.5 text-sm text-[var(--success)]">Your account is ready. Sign in to continue.</p>}
          <LoginForm error={error}/>
          <p className="login-signup-link mt-5 text-center text-xs text-[var(--muted)]">New to Personna? <Link href="/signup" className="font-semibold text-[var(--strawberry)] hover:underline">Create an account</Link></p>
          <div className="login-security mt-6 flex items-center justify-center gap-2 text-xs font-medium text-[color-mix(in_srgb,var(--tan),transparent_36%)]"><CircleCheck size={14} className="text-[var(--success)]"/> Your workspace stays private and secure</div>
        </div>
        <p className="text-xs font-medium text-[color-mix(in_srgb,var(--tan),transparent_48%)]">One system. Every responsibility. Meaningful progress.</p>
      </section>

      <aside aria-label="Personna dashboard illustration" className="login-art relative hidden h-full min-h-0 overflow-hidden lg:flex lg:items-center lg:justify-center">
        <div aria-hidden="true" className="absolute inset-0 opacity-[.16]" style={{ backgroundImage: "linear-gradient(color-mix(in srgb,var(--grauzone),transparent 80%) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--grauzone),transparent 80%) 1px,transparent 1px)", backgroundSize: "52px 52px", maskImage: "radial-gradient(ellipse at center,black,transparent 72%)" }}/>
        <div aria-hidden="true" className="absolute right-[-8rem] top-[-10rem] size-[520px] rounded-full bg-[var(--eggplant)]/30 blur-[110px]"/>
        <div aria-hidden="true" className="absolute bottom-[-11rem] left-[-4rem] size-[500px] rounded-full bg-[var(--strawberry)]/10 blur-[110px]"/>
        <div className="login-art-inner relative w-full max-w-[740px]">
          <div className="login-orbit relative mx-auto aspect-square">
            <svg viewBox="0 0 600 600" fill="none" className="absolute inset-0 size-full" aria-hidden="true">
              <defs><linearGradient id="orbital" x1="90" y1="80" x2="500" y2="520" gradientUnits="userSpaceOnUse"><stop stopColor="#FF84AE"/><stop offset=".48" stopColor="#A56BFF"/><stop offset="1" stopColor="#5EC9FF"/></linearGradient><radialGradient id="core" cx="0" cy="0" r="1" gradientTransform="matrix(0 150 -150 0 300 292)" gradientUnits="userSpaceOnUse"><stop stopColor="#FF9AC1" stopOpacity=".48"/><stop offset=".55" stopColor="#A84FE4" stopOpacity=".18"/><stop offset="1" stopColor="#1E3442" stopOpacity="0"/></radialGradient><filter id="blur"><feGaussianBlur stdDeviation="20"/></filter></defs>
              <circle cx="300" cy="292" r="203" fill="url(#core)"/><circle cx="300" cy="292" r="174" stroke="url(#orbital)" strokeOpacity=".22"/><circle cx="300" cy="292" r="130" stroke="url(#orbital)" strokeOpacity=".42" strokeDasharray="3 8"/><ellipse cx="300" cy="292" rx="202" ry="78" transform="rotate(-32 300 292)" stroke="url(#orbital)" strokeOpacity=".62"/><ellipse cx="300" cy="292" rx="202" ry="78" transform="rotate(45 300 292)" stroke="url(#orbital)" strokeOpacity=".32"/>
              <circle cx="300" cy="292" r="79" fill="url(#orbital)" fillOpacity=".13"/><circle cx="300" cy="292" r="59" fill="#1E3442" stroke="url(#orbital)" strokeOpacity=".75"/><path d="M278 294.5 293 309l31-34" stroke="#FFB3CF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="144" cy="199" r="5" fill="#FF84AE"/><circle cx="457" cy="384" r="5" fill="#86CCFF"/><circle cx="370" cy="102" r="4" fill="#C78DFF"/><circle cx="194" cy="453" r="4" fill="#FF84AE"/>
              <circle cx="300" cy="292" r="176" stroke="#FFF" strokeOpacity=".035"/>
            </svg>
            <div className="absolute left-[2%] top-[21%] rounded-xl bg-[#223647]/85 p-4 shadow-[0_18px_60px_#080D1B66] backdrop-blur-xl sm:left-0"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--muted)]"><Activity size={13} className="text-[#FF84AE]"/> Daily momentum</div><p className="mt-3 text-2xl font-extrabold tracking-tight text-white">One step at a time</p><div className="mt-3 flex gap-1.5">{[34, 48, 40, 68, 57, 82, 100].map((height, i) => <span key={i} className="w-5 rounded-sm bg-[linear-gradient(180deg,#FF84AE,#765BE9)] opacity-90" style={{ height: `${height * .28}px` }}/>)}</div></div>
            <div className="absolute right-[1%] top-[17%] flex items-center gap-3 rounded-xl bg-[#263748]/90 px-4 py-3 shadow-[0_18px_60px_#080D1B66] backdrop-blur-xl sm:right-0"><span className="grid size-9 place-items-center rounded-lg bg-[linear-gradient(145deg,#FF6C9A,#9A4BD2)]"><CircleCheck size={17} className="text-white"/></span><div><p className="text-xs font-bold text-white">Focus, without the noise</p><p className="mt-1 text-[10px] font-medium text-[var(--muted)]">Your day in one clear view</p></div></div>
            <div className="absolute bottom-[15%] left-[9%] rounded-xl bg-[#202F40]/90 px-4 py-3 shadow-[0_18px_60px_#080D1B66] backdrop-blur-xl"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--muted)]">Make room for</p><p className="mt-1 text-sm font-extrabold text-white">What matters next <ArrowUpRight size={13} className="ml-1 inline text-[#C99BFF]"/></p></div>
          </div>
          <div className="relative mx-auto mt-[-1rem] max-w-[480px] text-center"><p className="text-2xl font-extrabold tracking-[-.04em] text-white xl:text-3xl">See your whole life, <span className="text-transparent bg-clip-text bg-[linear-gradient(100deg,#FF84AE,#C77DF2,#82A5FF)]">moving forward.</span></p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[color-mix(in_srgb,var(--tan),transparent_38%)]">Bring your plans, projects, money, and personal growth into one thoughtful space.</p></div>
        </div>
      </aside>
    </div>
  </main>;
}
