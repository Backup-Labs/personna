import type { ReactNode } from "react";
import { AppNavigation } from "@/components/app-navigation";
import { AppTopbar } from "@/components/app-topbar";
import { Card } from "@/components/ui/card";

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="app-frame min-h-screen">
    <a href="#main-content" className="sr-only fixed left-3 top-3 z-[100] rounded-xl bg-[var(--strawberry)] px-4 py-3 text-sm font-semibold text-[var(--ink)] focus:not-sr-only">Skip to content</a>
    <aside className="app-sidebar fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[var(--border-strong)] bg-[var(--surface-1)] px-3 py-5 lg:flex"><AppNavigation variant="sidebar"/></aside>
    <div className="app-content min-h-screen"><AppTopbar/><main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</main></div>
    <AppNavigation variant="mobile"/>
  </div>;
}

export function PageHeading({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) { return <header className="page-heading mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p></div>{actions}</header>; }

export function Surface({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) { return <Card id={id} className={className}>{children}</Card>; }
