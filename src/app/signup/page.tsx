import Link from "next/link";
import { pricing } from "@/content/pricing";
import { Activity, ArrowUpRight, CircleCheck, Sparkles } from "@/components/ui/icons";
import { BrandMark } from "@/components/brand-mark";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Create your account · Personna" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ plan?: string; billing?: string }> }) {
  const params = await searchParams;
  const selectedPlan = params.plan === "business" && pricing.businessAvailable
    ? pricing.business
    : pricing.plans.find(plan => plan.id === params.plan);
  const billing = params.billing === "monthly" ? "monthly" : "annual";
  return <main className="signup-shell grain relative isolate min-h-dvh overflow-hidden">
    <div aria-hidden="true" className="pointer-events-none absolute -left-44 top-[20%] size-[480px] rounded-full bg-[var(--strawberry)]/10 blur-[120px]"/>
    <div className="login-layout mx-auto grid min-h-dvh w-full max-w-[1920px] lg:grid-cols-[minmax(390px,.88fr)_minmax(0,1.12fr)]">
      <section className="relative z-10 flex min-w-0 flex-col justify-between gap-8 px-6 py-6 sm:px-10 lg:px-8 xl:px-14">
        <Link href="/" aria-label="Personna home" className="inline-flex w-fit items-center gap-3 text-[var(--tan)]"><BrandMark size="small"/><span className="text-xl font-extrabold tracking-[-.04em]">personna<span className="text-[var(--strawberry)]">.</span></span></Link>
        <div className="mx-auto w-full max-w-[420px] py-2">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/[.045] px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#D7B7F4]"><span className="size-1.5 rounded-full bg-[var(--strawberry)]"/> YOUR PERSONAL OPERATING SYSTEM</div>
          <h1 className="text-[36px] font-extrabold leading-[1.03] tracking-[-.06em] text-white sm:text-[42px]">Make space for what matters<span className="text-[var(--strawberry)]">.</span></h1>
          <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--tan),transparent_24%)]">Create your private workspace. Your plans, projects, and progress stay yours.</p>
          {selectedPlan && <p role="status" className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--muted)]">{selectedPlan.name} · {billing} billing selected. Paid plans are not active in this early-access build.</p>}
          <SignupForm/>
          <p className="mt-5 text-center text-xs text-[var(--muted)]">Already have an account? <Link href="/login" className="font-semibold text-[var(--strawberry)] hover:underline">Sign in</Link></p>
        </div>
        <p className="text-xs font-medium text-[color-mix(in_srgb,var(--tan),transparent_48%)]">One system. Every responsibility. Meaningful progress.</p>
      </section>
      <aside aria-label="Personna workspace preview" className="signup-art relative hidden min-h-[680px] overflow-hidden lg:flex lg:items-center lg:justify-center">
        <div aria-hidden="true" className="absolute inset-0 opacity-[.16]" style={{ backgroundImage: "linear-gradient(color-mix(in srgb,var(--grauzone),transparent 80%) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--grauzone),transparent 80%) 1px,transparent 1px)", backgroundSize: "52px 52px", maskImage: "radial-gradient(ellipse at center,black,transparent 72%)" }}/>
        <div className="relative mx-auto w-full max-w-[680px] px-8 py-12">
          <div className="relative mx-auto grid aspect-square w-full max-w-[540px] place-items-center">
            <div className="signup-orbit absolute inset-[8%] rounded-full border border-white/10"/><div className="signup-orbit signup-orbit-inner absolute inset-[20%] rounded-full border border-white/10"/>
            <div className="relative grid size-[34%] place-items-center rounded-full border border-[color-mix(in_srgb,var(--strawberry),transparent_50%)] bg-[var(--surface-1)] text-[var(--strawberry)] shadow-[0_0_90px_color-mix(in_srgb,var(--strawberry),transparent_78%)]"><Sparkles size={44}/></div>
            <div className="absolute left-[3%] top-[22%] rounded-xl bg-[#223647]/90 p-4 shadow-2xl backdrop-blur-xl"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--muted)]"><Activity size={13} className="text-[var(--strawberry)]"/> Your momentum</p><p className="mt-2 text-lg font-extrabold text-white">Small steps add up</p><div className="mt-3 flex h-8 items-end gap-1.5">{[12, 20, 15, 28, 23, 32].map((height, index) => <span key={index} className="w-3 rounded-sm bg-[var(--strawberry)]/80" style={{ height }}/>)}</div></div>
            <div className="absolute right-[2%] top-[27%] flex items-center gap-3 rounded-xl bg-[#263748]/95 px-4 py-3 shadow-2xl"><span className="grid size-9 place-items-center rounded-lg bg-[var(--surface-2)] text-[var(--success)]"><CircleCheck size={17}/></span><div><p className="text-xs font-bold text-white">One clear view</p><p className="mt-1 text-[10px] text-[var(--muted)]">Your work, life, and goals</p></div></div>
            <div className="absolute bottom-[16%] left-[14%] rounded-xl bg-[#202F40]/95 px-4 py-3 shadow-2xl"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--muted)]">Build a life that moves</p><p className="mt-1 text-sm font-extrabold text-white">At your own pace <ArrowUpRight size={13} className="ml-1 inline text-[var(--strawberry)]"/></p></div>
          </div>
          <p className="mt-[-1rem] text-center text-2xl font-extrabold tracking-[-.04em] text-white">Clarity for the whole picture<span className="text-[var(--strawberry)]">.</span></p>
          <p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-[color-mix(in_srgb,var(--tan),transparent_38%)]">A thoughtful home for your priorities, time, finances, and personal growth.</p>
        </div>
      </aside>
    </div>
  </main>;
}
