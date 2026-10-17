"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, CircleUserRound, Clock3, LogOut, Settings2, Sparkles } from "@/components/ui/icons";
import { signOutAction } from "@/app/login/actions";
import { CommandMenu } from "@/components/command-menu";
import { QuickAddMenu } from "@/components/quick-add-menu";

const titles: Record<string, string> = { "/dashboard": "Dashboard", "/": "Dashboard", "/inbox": "Inbox", "/tasks": "Tasks", "/projects": "Projects", "/time": "Time", "/finance": "Finance", "/learning": "Learning", "/growth": "Goals & Habits", "/notes": "Notes", "/assistant": "AI Assistant", "/settings": "Settings", "/design": "Design system" };

export function AppTopbar() {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Personna";
  const date = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());
  return <header className="app-topbar sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--ink),transparent_7%)] px-4 backdrop-blur-xl sm:px-6">
    <div className="min-w-0"><p className="truncate text-sm font-semibold">{title}</p><p className="hidden text-[10px] text-[var(--muted)] sm:block">{date} <span aria-hidden="true">·</span> Your personal workspace</p></div>
    <div className="flex shrink-0 items-center gap-2"><div className="hidden md:block"><CommandMenu/></div><div className="hidden sm:block"><Link href="/time" className="topbar-icon" aria-label="Open focus timer" title="Focus timer"><Clock3 size={17}/></Link></div><div className="hidden sm:block"><QuickAddMenu/></div>
      <details className="relative"><summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-2.5 hover:border-[var(--strawberry)]" aria-label="Account menu"><span className="grid size-7 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--strawberry)]"><CircleUserRound size={17}/></span><ChevronDown size={13} className="text-[var(--muted)]"/></summary><div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-1.5 shadow-2xl"><Link href="/settings" className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs hover:bg-[var(--surface-2)]"><Settings2 size={15}/>Profile & settings</Link><Link href="/assistant" className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs hover:bg-[var(--surface-2)]"><Sparkles size={15}/>Assistant privacy</Link><form action={signOutAction}><button className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-xs hover:bg-[var(--surface-2)]"><LogOut size={15}/>Sign out</button></form></div></details>
    </div>
  </header>;
}
