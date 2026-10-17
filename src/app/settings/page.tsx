import Link from "next/link";
import { Activity, ArrowDownToLine, ArrowUpRight, CircleUserRound, Database, LockKeyhole, ShieldCheck, SlidersHorizontal, Sparkles } from "@/components/ui/icons";
import { ActionForm, Field } from "@/components/action-form";
import { AppShell, PageHeading } from "@/components/app-shell";
import { Card, CardHeader } from "@/components/ui/card";
import { auth } from "../../../auth";
import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import type { SettingsDocument } from "@/server/db/collections";
import { updateSettingsAction } from "@/server/actions/settings";

export const dynamic = "force-dynamic";

const sections = [{ id: "profile", label: "Profile", Icon: CircleUserRound }, { id: "preferences", label: "Preferences", Icon: SlidersHorizontal }, { id: "privacy", label: "AI & privacy", Icon: Sparkles }, { id: "data", label: "Data & backup", Icon: Database }, { id: "security", label: "Security", Icon: ShieldCheck }];

export default async function SettingsPage() {
  const [userId, session] = await Promise.all([requireUserId(), auth()]);
  const settings = await (await getDatabase()).collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null });
  const name = session?.user.name || "Personna user";
  const email = session?.user.email || "";
  const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  return <AppShell><PageHeading title="Settings" description="Your profile, workspace preferences, privacy, and data controls."/>
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Settings sections" className="h-fit rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-2 lg:sticky lg:top-20">{sections.map(({ id, label, Icon }) => <a key={id} href={`#${id}`} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--tan)]"><Icon size={17}/>{label}</a>)}</nav>
      <div className="min-w-0 space-y-5">
        <section id="profile"><Card variant="featured"><CardHeader title="Profile" subtitle="Your private Personna workspace." icon={CircleUserRound}/><div className="flex flex-wrap items-center gap-4"><span className="grid size-16 place-items-center rounded-2xl border border-[var(--strawberry)]/40 bg-[var(--surface-2)] font-display text-xl font-semibold text-[var(--strawberry)]">{initials}</span><div className="min-w-0"><p className="font-display text-xl font-semibold">{name}</p><p className="mt-1 text-sm text-[var(--muted)]">{email}</p><p className="mt-2 text-xs text-[var(--muted)]">Your account is secured with bcrypt credentials and signed sessions.</p></div></div></Card></section>
        <section id="preferences"><Card><CardHeader title="Preferences" subtitle="Set your locale, currency, timezone, and focus capacity." icon={SlidersHorizontal}/><ActionForm action={updateSettingsAction}><div className="grid gap-4 sm:grid-cols-2"><Field label="Base currency" name="baseCurrency"><select name="baseCurrency" defaultValue={settings?.baseCurrency ?? "RWF"} className="form-control"><option>RWF</option><option>USD</option></select></Field><Field label="Locale" name="locale" defaultValue={settings?.locale ?? "en-RW"}/><Field label="Timezone" name="timezone" defaultValue={settings?.timezone ?? "Africa/Kigali"}/><Field label="Active project limit" name="activeProjectLimit" type="number" defaultValue={String(settings?.activeProjectLimit ?? 5)}/><Field label="AI assistant preference" name="aiEnabled"><select name="aiEnabled" defaultValue={settings?.aiEnabled ? "true" : "false"} className="form-control"><option value="false">Disabled</option><option value="true">Enabled when a provider is configured</option></select></Field></div></ActionForm><p className="mt-4 text-xs leading-5 text-[var(--muted)]">The project limit keeps your active work in progress manageable. Timezone controls date boundaries and planned time blocks.</p></Card></section>
        <section id="privacy"><Card><CardHeader title="AI & privacy" subtitle="Personna does not currently send workspace data to an AI provider." icon={LockKeyhole}/><div className="flex items-start gap-3 rounded-xl border border-[var(--warning)]/30 bg-[color-mix(in_srgb,var(--warning),transparent_94%)] p-4"><Activity size={18} className="mt-0.5 shrink-0 text-[var(--warning)]"/><div><p className="text-sm font-semibold">Assistant tools are not connected</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">The assistant remains informational until a provider, per-scope consent, access logging, and proposal confirmation are implemented. No notes, tasks, time, or finance data are sent.</p><Link href="/assistant" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--strawberry)]">View assistant status <ArrowUpRight size={13}/></Link></div></div></Card></section>
        <section id="data"><Card><CardHeader title="Data & backup" subtitle="Download active records owned by your account." icon={Database}/><p className="mb-4 text-sm text-[var(--muted)]">JSON includes your workspace records. CSV contains transactions. Authentication hashes are excluded.</p><div className="flex flex-wrap gap-3"><a href="/api/export?format=json" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-strong)] px-4 text-sm hover:border-[var(--strawberry)]"><ArrowDownToLine size={16}/>JSON backup</a><a href="/api/export?format=csv" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-strong)] px-4 text-sm hover:border-[var(--strawberry)]"><ArrowDownToLine size={16}/>Transactions CSV</a></div></Card></section>
        <section id="security"><Card><CardHeader title="Security" subtitle="Account protections currently enabled." icon={ShieldCheck}/><ul className="grid gap-3 sm:grid-cols-2">{[{ title: "Password storage", detail: "Passwords are hashed with bcrypt." }, { title: "Session handling", detail: "Signed JWT sessions via Auth.js." }, { title: "User data scope", detail: "Reads and writes are scoped to your verified account." }, { title: "Database", detail: "MongoDB connection settings stay server-side." }].map(item => <li key={item.title} className="rounded-xl border border-[var(--border)] bg-[var(--ink)] p-3"><p className="text-xs font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.detail}</p></li>)}</ul><p className="mt-4 text-xs text-[var(--muted)]">For deployment, use a unique AUTH_SECRET and encrypted, access-controlled MongoDB backups.</p></Card></section>
      </div>
    </div>
  </AppShell>;
}
