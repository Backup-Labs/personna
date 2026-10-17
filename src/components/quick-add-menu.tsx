"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CircleDollarSign, ListTodo, NotebookPen, Plus, Sparkles } from "@/components/ui/icons";

const options = [{ href: "/tasks", label: "Task", Icon: ListTodo }, { href: "/finance", label: "Expense", Icon: CircleDollarSign }, { href: "/notes", label: "Note or idea", Icon: NotebookPen }, { href: "/growth", label: "Habit check-in", Icon: Sparkles }];

export function QuickAddMenu({ compact = false }: { compact?: boolean }) {
  return <DropdownMenu.Root><DropdownMenu.Trigger asChild><button type="button" className={compact ? "mobile-capture" : "inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--strawberry)] px-3.5 text-xs font-semibold text-[var(--ink)] shadow-[0_0_24px_#FF5C8D22] transition hover:shadow-[0_0_24px_#FF5C8D44]"} aria-label="Quick add"><Plus size={compact ? 22 : 16}/>{!compact && "Quick add"}</button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-52 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-1.5 shadow-2xl">{options.map(({ href, label, Icon }) => <DropdownMenu.Item key={label} asChild><Link href={href} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm outline-none transition hover:bg-[var(--surface-2)] focus-visible:bg-[var(--surface-2)]"><Icon size={16} className="text-[var(--strawberry)]"/>{label}</Link></DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>;
}
