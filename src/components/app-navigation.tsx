"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, CircleDollarSign, Command, FolderKanban, Goal, Inbox, LayoutDashboard, ListTodo, NotebookPen, Settings2, Sparkles, Timer, type LucideIcon } from "@/components/ui/icons";
import * as Dialog from "@radix-ui/react-dialog";
import { QuickAddMenu } from "@/components/quick-add-menu";

const groups: { label: string; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
  { label: "Overview", items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, { href: "/inbox", label: "Inbox", icon: Inbox }] },
  { label: "Execute", items: [{ href: "/projects", label: "Projects", icon: FolderKanban }, { href: "/tasks", label: "Tasks", icon: ListTodo }, { href: "/time", label: "Time", icon: Timer }] },
  { label: "Money", items: [{ href: "/finance", label: "Finance", icon: CircleDollarSign }] },
  { label: "Grow", items: [{ href: "/learning", label: "Learning", icon: BookOpen }, { href: "/growth", label: "Goals & Habits", icon: Goal }, { href: "/notes", label: "Notes", icon: NotebookPen }] },
  { label: "Assist", items: [{ href: "/assistant", label: "AI Assistant", icon: Sparkles }] },
];
const allItems = groups.flatMap(group => group.items).concat([{ href: "/settings", label: "Settings", icon: Settings2 }]);

export function AppNavigation({ variant }: { variant: "sidebar" | "mobile" }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem("personna.sidebar-collapsed") === "true";
    setCollapsed(saved);
    document.documentElement.style.setProperty("--sidebar-width", saved ? "76px" : "260px");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "[" && !event.altKey && !event.ctrlKey && !event.metaKey && !(event.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(event.target.tagName))) {
        setCollapsed(current => { const next = !current; window.localStorage.setItem("personna.sidebar-collapsed", String(next)); document.documentElement.style.setProperty("--sidebar-width", next ? "76px" : "260px"); return next; });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const active = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  if (variant === "sidebar") return <>
    <div className={`mb-7 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
      {!collapsed && <Link href="/dashboard" aria-label="Personna home" className="flex min-w-0 items-center gap-3 px-2"><span className="brand-mark"><Sparkles size={17} strokeWidth={1.7}/></span><span className="font-display text-xl font-semibold tracking-tight">personna<span className="text-[var(--strawberry)]">.</span></span></Link>}
      {collapsed && <Link href="/dashboard" aria-label="Personna home" className="brand-mark"><Sparkles size={17} strokeWidth={1.7}/></Link>}
      <button type="button" onClick={() => setCollapsed(current => { const next = !current; window.localStorage.setItem("personna.sidebar-collapsed", String(next)); document.documentElement.style.setProperty("--sidebar-width", next ? "76px" : "260px"); return next; })} className="icon-button size-9 shrink-0" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title="Toggle sidebar ([)"><ChevronLeft size={16} className={collapsed ? "rotate-180" : ""}/></button>
    </div>
    <nav aria-label="Main navigation" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      {groups.map(group => <section key={group.label}><h2 className={`mb-1 px-3 font-mono text-[9px] font-semibold uppercase tracking-[.17em] text-[var(--muted)] ${collapsed ? "sr-only" : ""}`}>{group.label}</h2><div className="grid gap-0.5">{group.items.map(({ href, label, icon: Icon }) => <NavLink key={href} href={href} label={label} Icon={Icon} current={active(href)} collapsed={collapsed}/>)}</div></section>)}
    </nav>
    <div className="mt-3 border-t border-[var(--border-strong)] pt-3"><NavLink href="/settings" label="Settings" Icon={Settings2} current={active("/settings")} collapsed={collapsed}/>{!collapsed && <p className="mt-2 px-3 text-[9px] text-[var(--muted)]">Press [ to collapse</p>}</div>
  </>;

  return <>
    <nav aria-label="Mobile navigation" className="mobile-tabs fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 items-center border-t border-[var(--border-strong)] bg-[var(--ink)]/95 px-2 pt-2 backdrop-blur-xl lg:hidden">
      <MobileTab href="/dashboard" label="Home" Icon={LayoutDashboard} current={active("/dashboard")}/>
      <MobileTab href="/projects" label="Projects" Icon={FolderKanban} current={active("/projects")}/>
      <div className="flex justify-center"><QuickAddMenu compact/></div>
      <MobileTab href="/finance" label="Finance" Icon={CircleDollarSign} current={active("/finance")}/>
      <button type="button" onClick={() => setMoreOpen(true)} aria-expanded={moreOpen} aria-haspopup="dialog" className={`mobile-nav-link ${moreOpen ? "text-[var(--strawberry)]" : ""}`}><Command size={18}/><span>More</span></button>
    </nav>
    <Dialog.Root open={moreOpen} onOpenChange={setMoreOpen}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--ink)]/75 backdrop-blur-sm lg:hidden"/><Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto rounded-t-[24px] border border-[var(--border-strong)] bg-[var(--surface-1)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl lg:hidden"><Dialog.Title className="mb-4 font-display text-lg font-semibold">All modules</Dialog.Title><div className="grid grid-cols-2 gap-2">{allItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMoreOpen(false)} className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 text-sm ${active(href) ? "border-[var(--strawberry)] text-[var(--strawberry)]" : "border-[var(--border-strong)] hover:bg-[var(--surface-2)]"}`}><Icon size={17}/>{label}</Link>)}</div><Dialog.Close className="mt-4 w-full rounded-xl border border-[var(--border-strong)] py-3 text-sm">Close</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
  </>;
}

function NavLink({ href, label, Icon, current, collapsed }: { href: string; label: string; Icon: LucideIcon; current: boolean; collapsed: boolean }) {
  return <Link href={href} aria-current={current ? "page" : undefined} aria-label={collapsed ? label : undefined} title={collapsed ? label : undefined} className={`nav-link ${current ? "nav-link-active" : ""} ${collapsed ? "justify-center px-0" : ""}`}><Icon className="nav-icon" size={18} strokeWidth={1.75}/>{!collapsed && <span>{label}</span>}{label === "Inbox" && !collapsed && <span className="ml-auto size-2 rounded-full bg-[var(--strawberry)]"/>}</Link>;
}

function MobileTab({ href, label, Icon, current }: { href: string; label: string; Icon: LucideIcon; current: boolean }) {
  return <Link href={href} aria-current={current ? "page" : undefined} className={`mobile-nav-link ${current ? "text-[var(--strawberry)]" : ""}`}><Icon size={19} strokeWidth={1.8}/><span>{label}</span></Link>;
}
