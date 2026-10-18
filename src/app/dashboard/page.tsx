import Link from "next/link";
import type { CSSProperties } from "react";
import { Activity, ArrowRight, ArrowUpRight, CalendarClock, CircleDollarSign, Clock3, FolderKanban, Goal, Inbox, ListTodo, ShieldCheck, Sparkles, Target, Wallet } from "@/components/ui/icons";
import { AppShell, PageHeading, Surface } from "@/components/app-shell";
import { StatTile } from "@/components/ui/stat-tile";
import { SectionHeader } from "@/components/patterns/section-header";
import { getDatabase } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { requireUserId } from "@/server/authenticated-user";
import { auth } from "../../../auth";
import { CompleteTaskButton } from "@/components/task-controls";
import { getAccountBalances } from "@/server/queries/finance";
import type { AccountDocument, BudgetDocument, GoalDocument, HabitDocument, HabitLogDocument, NoteDocument, ProjectDocument, SavingsGoalDocument, SettingsDocument, TaskDocument, TimeBlockDocument, TimeEntryDocument, TransactionDocument } from "@/server/db/collections";
import { fromZonedLocalDate, localDateKey, zonedDayRange, zonedMonthStart, zonedWeekStart } from "@/lib/dates";
import { WeeklyBars } from "@/components/charts/weekly-bars";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await auth();
  const userId = await requireUserId(session);
  const db = await getDatabase();
  const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null });
  const timezone = settings?.timezone ?? "Africa/Kigali";
  const locale = settings?.locale ?? "en-RW";
  const now = new Date();
  const { start: dayStart, end: dayEnd } = zonedDayRange(now, timezone);
  const { start: weekStart } = zonedWeekStart(now, timezone, settings?.weekStartsOn ?? 1);
  const monthStart = zonedMonthStart(now, timezone);
  const todayKey = localDateKey(now, timezone);
  const currentMonth = todayKey.slice(0, 7);
  const inactiveBefore = new Date(now.getTime() - 14 * 86_400_000);
  const [topTasks, dueToday, dueTodayCount, upcomingCount, overdueCount, projects, inactiveProjects, accounts, monthSpend, monthlyBudgets, inboxTasks, inboxNotes, habits, weekLogs, blocks, entries, goals, weekCompletedCount, weekEntries, savingsGoals] = await Promise.all([
    db.collection<TaskDocument>("tasks").find({ userId, deletedAt: null, isTop3Today: true, status: { $ne: "DONE" } }).sort({ updatedAt: -1 }).limit(3).toArray(),
    db.collection<TaskDocument>("tasks").find({ userId, deletedAt: null, status: { $ne: "DONE" }, dueDate: { $gte: dayStart, $lt: dayEnd } }).sort({ dueDate: 1 }).limit(5).toArray(),
    db.collection<TaskDocument>("tasks").countDocuments({ userId, deletedAt: null, status: { $ne: "DONE" }, dueDate: { $gte: dayStart, $lt: dayEnd } }),
    db.collection<TaskDocument>("tasks").countDocuments({ userId, deletedAt: null, status: { $ne: "DONE" }, dueDate: { $gte: dayEnd, $lt: new Date(dayEnd.getTime() + 7 * 86_400_000) } }),
    db.collection<TaskDocument>("tasks").countDocuments({ userId, deletedAt: null, status: { $ne: "DONE" }, dueDate: { $lt: dayStart } }),
    db.collection<ProjectDocument>("projects").find({ userId, deletedAt: null, status: "ACTIVE" }).sort({ lastActivityAt: -1 }).limit(4).toArray(),
    db.collection<ProjectDocument>("projects").countDocuments({ userId, deletedAt: null, status: "ACTIVE", lastActivityAt: { $lt: inactiveBefore } }),
    db.collection<AccountDocument>("accounts").find({ userId, deletedAt: null }).toArray(),
    db.collection<TransactionDocument>("transactions").aggregate<{ _id: string; total: number }>([{ $match: { userId, deletedAt: null, type: "EXPENSE", occurredAt: { $gte: monthStart, $lt: dayEnd } } }, { $group: { _id: "$currency", total: { $sum: "$amountMinor" } } }]).toArray(),
    db.collection<BudgetDocument>("budgets").find({ userId, deletedAt: null, month: currentMonth }).toArray(),
    db.collection<TaskDocument>("tasks").countDocuments({ userId, deletedAt: null, status: "INBOX" }),
    db.collection<NoteDocument>("notes").countDocuments({ userId, deletedAt: null, inbox: true }),
    db.collection<HabitDocument>("habits").find({ userId, deletedAt: null }).sort({ createdAt: 1 }).limit(5).toArray(),
    db.collection<HabitLogDocument>("habitLogs").find({ userId, date: { $gte: weekStart, $lte: todayKey }, deletedAt: null }).toArray(),
    db.collection<TimeBlockDocument>("timeBlocks").find({ userId, deletedAt: null, start: { $gte: dayStart, $lt: dayEnd } }).sort({ start: 1 }).limit(5).toArray(),
    db.collection<TimeEntryDocument>("timeEntries").find({ userId, deletedAt: null, start: { $gte: dayStart, $lt: now } }).toArray(),
    db.collection<GoalDocument>("goals").find({ userId, deletedAt: null, status: "ACTIVE" }).sort({ targetDate: 1 }).limit(3).toArray(),
    db.collection<TaskDocument>("tasks").countDocuments({ userId, deletedAt: null, status: "DONE", updatedAt: { $gte: fromZonedLocalDate(weekStart, timezone), $lt: dayEnd } }),
    db.collection<TimeEntryDocument>("timeEntries").find({ userId, deletedAt: null, start: { $gte: fromZonedLocalDate(weekStart, timezone), $lt: now } }).toArray(),
    db.collection<SavingsGoalDocument>("savingsGoals").find({ userId, deletedAt: null }).sort({ deadline: 1 }).limit(3).toArray(),
  ]);
  const projectTasks = projects.length ? await db.collection<TaskDocument>("tasks").find({ userId, projectId: { $in: projects.map(project => project._id!) }, deletedAt: null }).toArray() : [];
  const balances = await getAccountBalances(db, userId, accounts);
  const cashByCurrency = new Map<string, number>();
  for (const account of accounts) cashByCurrency.set(account.currency, (cashByCurrency.get(account.currency) ?? 0) + (balances.get(account._id!.toHexString()) ?? account.openingBalanceMinor));
  const name = session?.user.name?.trim() || "there";
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: timezone }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayLabel = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: timezone }).format(now);
  const focusMinutes = entries.reduce((sum, entry) => sum + Math.max(0, Math.round(((entry.end?.getTime() ?? now.getTime()) - Math.max(entry.start.getTime(), dayStart.getTime())) / 60_000)), 0);
  const focusPercent = Math.min(100, Math.round(focusMinutes / 360 * 100));
  const monthlySpendByCurrency = new Map(monthSpend.map(row => [row._id, row.total]));
  const overdueTotal = overdueCount;
  const weekFocusMinutes = weekEntries.reduce((sum, entry) => sum + Math.max(0, Math.round(((entry.end?.getTime() ?? now.getTime()) - entry.start.getTime()) / 60_000)), 0);
  const completedHabitLogs = weekLogs.filter(log => log.status === "DONE").length;
  const habitTargets = habits.reduce((total, habit) => total + habit.targetPerWeek, 0);
  const habitConsistency = habitTargets ? Math.min(100, Math.round(completedHabitLogs / habitTargets * 100)) : 0;
  const monthSpendTotal = [...monthlySpendByCurrency.values()].reduce((sum, value) => sum + value, 0);
  const focusByDay = Array.from({ length: 7 }, (_, offset) => { const date = new Date(`${weekStart}T12:00:00.000Z`); date.setUTCDate(date.getUTCDate() + offset); const key = date.toISOString().slice(0, 10); const minutes = weekEntries.filter(entry => localDateKey(entry.start, timezone) === key).reduce((sum, entry) => sum + Math.max(0, Math.round(((entry.end?.getTime() ?? now.getTime()) - entry.start.getTime()) / 60_000)), 0); return { label: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(date), value: minutes }; });
  return <AppShell>
    <div className="grain">
      <PageHeading title={`${greeting}, ${name}.`} description={`${todayLabel} · ${dueTodayCount} tasks today · ${overdueTotal} overdue`} actions={<Link href="/tasks" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--strawberry)] px-4 text-xs font-semibold text-[var(--ink)]"><ListTodo size={15}/> Plan today</Link>} />
      <SectionHeader title="Focus now" description="Decide what deserves your attention first."/>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <Surface className="surface-featured relative min-h-[260px] overflow-hidden p-6 md:col-span-2 xl:col-span-7 xl:min-h-[286px]">
          <div className="relative"><div className="mb-5 flex items-center justify-between"><p className="metric-label"><Target size={14} className="text-[var(--strawberry)]"/> TODAY’S TOP THREE</p><span className="flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-2.5 py-1 text-[10px] text-[var(--muted)]"><Activity size={12}/>{topTasks.length} OF 3</span></div>
            {topTasks.length ? <ul className="space-y-3">{topTasks.map((task, index) => <li key={task._id!.toHexString()} className="flex items-center gap-3"><CompleteTaskButton taskId={task._id!.toHexString()} done={false}/><span className="min-w-0 flex-1 truncate text-sm font-medium">{task.title}</span><span className="font-mono text-[10px] text-[var(--muted)]">0{index + 1}</span></li>)}</ul> : <div className="rounded-xl border border-dashed border-[var(--border-strong)] p-4"><p className="text-sm text-[var(--muted)]">Select the few tasks that deserve your attention today.</p><Link href="/tasks" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--strawberry)]">Choose today’s priorities <ArrowRight size={14}/></Link></div>}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-4"><div><p className="metric-label"><Clock3 size={13}/> FOCUSED TODAY</p><p className="mt-1 font-display text-2xl font-semibold metric-number">{Math.floor(focusMinutes / 60)}h {focusMinutes % 60}m <span className="font-sans text-xs font-normal text-[var(--muted)]">of 6h target</span></p></div><div className="flex items-center gap-3"><div className="progress-ring" style={{ "--progress": `${focusPercent}%` } as CSSProperties}><span>{focusPercent}<small>%</small></span></div><Link href="/time" className="text-xs text-[var(--strawberry)]">Open time</Link></div></div>
          </div>
        </Surface>
        <Surface className="flex min-h-[260px] flex-col justify-between md:col-span-1 xl:col-span-5">
          <div><p className="metric-label"><CalendarClock size={14}/> DUE TODAY</p><p className="mt-4 font-display text-5xl font-semibold metric-number">{dueTodayCount}</p><p className="mt-1 text-xs text-[var(--muted)]">{overdueTotal} overdue / {upcomingCount} coming this week</p></div>
          <div className="space-y-2 border-t border-[var(--border)] pt-3">{dueToday.slice(0, 2).map(task => <p key={task._id!.toHexString()} className="truncate text-xs">{task.title}</p>)}{dueToday.length === 0 && <p className="text-xs text-[var(--muted)]">A clear runway for today.</p>}<Link href="/tasks" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--strawberry)]">View tasks <ArrowRight size={13}/></Link></div>
        </Surface>
        <div className="col-span-full mt-2"><SectionHeader title="How am I doing" description="A weekly pulse across work, focus, money, and routines."/><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatTile label="Tasks finished" value={weekCompletedCount} detail="Updated this week" icon={ListTodo}/><StatTile label="Focused time" value={`${Math.floor(weekFocusMinutes / 60)}h ${weekFocusMinutes % 60}m`} detail="Across the current week" icon={Clock3}/><StatTile label="Spent this month" value={monthlySpendByCurrency.size === 1 ? formatMoney(monthSpendTotal, [...monthlySpendByCurrency.keys()][0] as "RWF" | "USD", locale) : `${monthlySpendByCurrency.size} currencies`} detail={monthlySpendByCurrency.size === 1 && monthlyBudgets.some(item => item.currency === [...monthlySpendByCurrency.keys()][0]) ? `${Math.round(monthSpendTotal / monthlyBudgets.filter(item => item.currency === [...monthlySpendByCurrency.keys()][0]).reduce((sum, item) => sum + item.amountMinor, 0) * 100)}% of budget used` : "See budgets by currency in Finance"} icon={Wallet}/><StatTile label="Habit consistency" value={`${habitConsistency}%`} detail={`${completedHabitLogs} completions this week`} icon={Activity}/></div></div>
        <div className="col-span-full"><WeeklyBars title="Focus across the week" description="Recorded focus time by day." points={focusByDay}/></div>
        <div className="col-span-full mt-2"><SectionHeader title="Money and attention" description="Keep balances, budgets, savings, and open loops in view."/></div>
        <Surface className="flex min-h-[220px] flex-col justify-between bg-[var(--surface-1)] md:col-span-1 xl:col-span-3">
          <div><p className="metric-label"><Wallet size={14}/> CASH POSITION</p>{cashByCurrency.size ? [...cashByCurrency].map(([currency, amount]) => <p key={currency} className="mt-3 font-display text-2xl font-semibold metric-number">{formatMoney(amount, currency as "RWF" | "USD", locale)}</p>) : <p className="mt-4 text-sm text-[var(--muted)]">Add an account to see your balance.</p>}</div>
          <div className="border-t border-[var(--border)] pt-3">{[...monthlySpendByCurrency].length ? [...monthlySpendByCurrency].map(([currency, total]) => { const budget = monthlyBudgets.filter(item => item.currency === currency).reduce((sum, item) => sum + item.amountMinor, 0); return <div key={currency} className="mb-2"><p className="flex justify-between text-xs"><span className="text-[var(--muted)]">Month spend</span><span className="font-semibold">{formatMoney(total, currency as "RWF" | "USD", locale)}{budget ? ` / ${formatMoney(budget, currency as "RWF" | "USD", locale)}` : ""}</span></p>{budget > 0 && <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className={`h-full rounded-full ${total / budget >= .9 ? "bg-[var(--danger)]" : total / budget >= .7 ? "bg-[var(--warning)]" : "bg-[var(--success)]"}`} style={{ width: `${Math.min(100, total / budget * 100)}%` }}/></div>}</div>; }) : <p className="text-xs text-[var(--muted)]">No spending recorded this month.</p>}<Link href="/finance" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--strawberry)]">Open finance <ArrowRight size={13}/></Link></div>
        </Surface>
        <Surface className="flex min-h-[220px] flex-col justify-between md:col-span-1 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between"><div><p className="metric-label"><Target size={14}/> BUDGET PACE</p><h2 className="mt-1 font-display text-lg font-semibold">This month</h2></div><Link href="/finance" aria-label="Open budgets" className="icon-button size-8"><ArrowRight size={15}/></Link></div>
          {monthlyBudgets.length ? <div className="space-y-4">{[...new Set(monthlyBudgets.map(item => item.currency))].map(currency => { const limit = monthlyBudgets.filter(item => item.currency === currency).reduce((sum, item) => sum + item.amountMinor, 0); const spent = monthlySpendByCurrency.get(currency) ?? 0; const remaining = Math.max(0, limit - spent); const ratio = limit ? spent / limit : 0; const fill = ratio >= .9 ? "var(--danger)" : ratio >= .7 ? "var(--warning)" : "var(--grad-bar)"; return <div key={currency}><div className="mb-1 flex justify-between text-xs"><span className="text-[var(--muted)]">{currency} remaining</span><span className="font-mono">{formatMoney(remaining, currency as "RWF" | "USD", locale)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full" style={{ width: `${Math.min(100, ratio * 100)}%`, background: fill }}/></div><p className="mt-1 text-right text-[10px] text-[var(--muted)]">{Math.round(ratio * 100)}% used</p></div>; })}</div> : <p className="text-sm text-[var(--muted)]">Add category limits to track spending pace.</p>}
          <Link href="/finance" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--strawberry)]">Manage budgets <ArrowRight size={13}/></Link>
        </Surface>
        <Surface className="flex min-h-[220px] flex-col justify-between md:col-span-1 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between"><div><p className="metric-label"><ShieldCheck size={14}/> FUTURE YOU</p><h2 className="mt-1 font-display text-lg font-semibold">Savings</h2></div><Link href="/finance" aria-label="Open savings goals" className="icon-button size-8"><ArrowRight size={15}/></Link></div>
          {savingsGoals.length ? <ul className="space-y-3">{savingsGoals.map(goal => { const percent = Math.min(100, Math.round(goal.currentMinor / goal.targetMinor * 100)); return <li key={goal._id!.toHexString()}><div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-medium">{goal.name}</p><span className="font-mono text-[10px] text-[var(--muted)]">{percent}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-[var(--strawberry)]" style={{ width: `${percent}%` }}/></div><p className="mt-1 text-[10px] text-[var(--muted)]">{formatMoney(goal.currentMinor, goal.currency, locale)} / {formatMoney(goal.targetMinor, goal.currency, locale)}</p></li>; })}</ul> : <p className="text-sm text-[var(--muted)]">A savings target gives future plans a number to grow toward.</p>}
          <Link href="/finance" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--strawberry)]">Open savings goals <ArrowRight size={13}/></Link>
        </Surface>
        <Surface className="flex min-h-[220px] flex-col justify-between md:col-span-1 xl:col-span-3">
          <div className="flex items-start justify-between"><div><p className="metric-label"><Inbox size={14}/> INBOX</p><p className="mt-3 font-display text-4xl font-semibold metric-number">{inboxTasks + inboxNotes}</p><p className="text-xs text-[var(--muted)]">items to process</p></div><span className="grid size-10 place-items-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--strawberry)]"><Inbox size={18}/></span></div>
          <Link href="/inbox" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--strawberry)]">Clear your inbox <ArrowRight size={13}/></Link>
        </Surface>
        <div className="col-span-full mt-2"><SectionHeader title="Work and growth" description="See what is moving, what is quiet, and what matters over time."/></div>
        <Surface className="md:col-span-2 xl:col-span-8">
          <div className="mb-4 flex items-center justify-between"><div><p className="metric-label"><FolderKanban size={14}/> IN MOTION</p><h2 className="mt-1 font-display text-lg font-semibold">Active projects</h2></div><Link href="/projects" className="text-xs font-semibold text-[var(--strawberry)]">All projects <ArrowRight className="ml-1 inline" size={13}/></Link></div>
          {projects.length ? <div className="grid gap-3 sm:grid-cols-2">{projects.map(project => { const tasks = projectTasks.filter(task => task.projectId?.equals(project._id!)); const done = tasks.filter(task => task.status === "DONE").length; const progress = tasks.length ? Math.round(done / tasks.length * 100) : 0; const next = tasks.find(task => task._id?.equals(project.nextActionTaskId ?? undefined)); return <article key={project._id!.toHexString()} className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-4"><div className="flex items-center justify-between gap-3"><h3 className="truncate text-sm font-semibold">{project.title}</h3><span className="font-mono text-[10px] text-[var(--muted)]">{progress}%</span></div><p className="mt-2 truncate text-xs text-[var(--muted)]">{next ? `Next: ${next.title}` : "Add a next action to keep momentum."}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-[var(--strawberry)] transition-all" style={{ width: `${progress}%` }}/></div></article>; })}</div> : <EmptyLine icon={FolderKanban} text="No active projects yet." href="/projects" action="Create a project"/>}
        </Surface>
        <Surface className="xl:col-span-4">
          <div className="mb-4 flex items-center justify-between"><div><p className="metric-label"><Activity size={14}/> KEEP THE PROMISE</p><h2 className="mt-1 font-display text-lg font-semibold">Habit rhythm</h2></div><Link href="/growth" aria-label="Open habits" className="icon-button size-8"><ArrowRight size={15}/></Link></div>
          {habits.length ? <div className="space-y-3">{habits.map(habit => <div key={habit._id!.toHexString()} className="flex items-center justify-between gap-2"><span className="truncate text-xs">{habit.name}</span><div className="flex gap-1">{Array.from({ length: 7 }, (_, offset) => { const date = new Date(weekStart + "T12:00:00Z"); date.setUTCDate(date.getUTCDate() + offset); const key = date.toISOString().slice(0, 10); const log = weekLogs.find(item => item.habitId.equals(habit._id!) && item.date === key); return <span key={key} aria-label={`${key}: ${log?.status?.toLowerCase() ?? "open"}`} className={`size-3 rounded-sm border ${log?.status === "DONE" ? "border-[var(--success)] bg-[var(--success)]" : log?.status === "SKIPPED" ? "border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning),transparent_65%)]" : "border-[var(--border-strong)] bg-transparent"}`}/>; })}</div></div>)}</div> : <p className="text-sm text-[var(--muted)]">Create a habit to begin tracking consistency.</p>}
        </Surface>
        <Surface className="xl:col-span-4">
          <div className="mb-4 flex items-center justify-between"><div><p className="metric-label"><CalendarClock size={14}/> YOUR DAY</p><h2 className="mt-1 font-display text-lg font-semibold">Schedule</h2></div><Link href="/time" aria-label="Open calendar" className="icon-button size-8"><ArrowRight size={15}/></Link></div>
          {blocks.length ? <div className="space-y-3">{blocks.map(block => <div key={block._id!.toHexString()} className="flex gap-3 border-l-2 border-[var(--strawberry)] pl-3"><span className="w-12 shrink-0 font-mono text-[10px] text-[var(--muted)]">{block.start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: timezone })}</span><div><p className="text-xs font-medium">{block.title}</p><p className="text-[10px] text-[var(--muted)]">{block.category}</p></div></div>)}</div> : <p className="text-sm text-[var(--muted)]">No time blocks planned for today.</p>}
          <Link href="/time" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--strawberry)]">Plan a block <ArrowRight size={13}/></Link>
        </Surface>
        <Surface className="border-[color-mix(in_srgb,var(--strawberry),var(--border-strong)_60%)] xl:col-span-4">
          <div className="mb-4 flex items-center justify-between"><div><p className="metric-label"><Goal size={14}/> LONG VIEW</p><h2 className="mt-1 font-display text-lg font-semibold">Active goals</h2></div><Link href="/growth" aria-label="Open goals" className="icon-button size-8"><ArrowRight size={15}/></Link></div>
          {goals.length ? <ul className="space-y-3">{goals.map(goal => <li key={goal._id!.toHexString()}><p className="truncate text-xs font-medium">{goal.title}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{goal.area}{goal.targetDate ? ` · Target ${goal.targetDate.toLocaleDateString(locale, { timeZone: timezone })}` : ""}</p></li>)}</ul> : <p className="text-sm text-[var(--muted)]">Goals you care about will appear here.</p>}
        </Surface>
        <Surface className="md:col-span-2 xl:col-span-12"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[var(--eggplant)] text-[var(--tan)]"><Sparkles size={18}/></span><div><p className="text-sm font-semibold">Quick capture</p><p className="text-xs text-[var(--muted)]">Save a thought before you lose your flow.</p></div></div><div className="flex flex-wrap gap-2"><CaptureChip href="/tasks" icon={ListTodo} label="Task"/><CaptureChip href="/notes" icon={Activity} label="Note"/><CaptureChip href="/finance" icon={CircleDollarSign} label="Expense"/></div></div>{inactiveProjects>0&&<Link href="/projects" className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--warning)]/50 bg-[color-mix(in_srgb,var(--warning),transparent_92%)] px-3 py-2 text-xs"><Activity size={14} className="text-[var(--warning)]"/><span>{inactiveProjects} active {inactiveProjects===1?"project has":"projects have"} gone quiet for two weeks. Review the next action.</span><ArrowRight size={13} className="ml-auto"/></Link>}</Surface>
      </div>
      <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-strong)] pt-4 text-[10px] text-[var(--muted)]"><span>Personna · One system. Every responsibility. Meaningful progress.</span><span className="flex items-center gap-1.5"><Activity size={12}/> Your workspace is private</span></footer>
    </div>
  </AppShell>;
}

function EmptyLine({ icon: Icon, text, href, action }: { icon: typeof FolderKanban; text: string; href: string; action: string }) { return <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--border-strong)] p-4"><Icon size={17} className="text-[var(--muted)]"/><p className="flex-1 text-xs text-[var(--muted)]">{text}</p><Link href={href} className="text-xs font-semibold text-[var(--strawberry)]">{action}</Link></div>; }
function CaptureChip({ href, icon: Icon, label }: { href: string; icon: typeof ListTodo; label: string }) { return <Link href={href} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2.5 text-xs font-medium transition hover:border-[var(--strawberry)]"><Icon size={15} className="text-[var(--strawberry)]"/>{label}<ArrowUpRight size={12} className="text-[var(--muted)]"/></Link>; }
