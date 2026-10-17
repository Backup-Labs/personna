import { ActionForm, Field } from "@/components/action-form";
import { AppShell, PageHeading, Surface } from "@/components/app-shell";
import { createGoalAction, createHabitAction, createReviewAction, logHabitAction } from "@/server/actions/core";
import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import type { GoalDocument, HabitDocument, HabitLogDocument, ReviewDocument } from "@/server/db/collections";
import type { SettingsDocument } from "@/server/db/collections";
import { localDateKey, zonedWeekStart } from "@/lib/dates";
import { Check, Minus } from "@/components/ui/icons";
import { WeeklyBars } from "@/components/charts/weekly-bars";

export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  const userId = await requireUserId(); const db = await getDatabase();
  const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null });
  const timezone = settings?.timezone ?? "Africa/Kigali";
  const day = localDateKey(new Date(), timezone);
  const weekStart = zonedWeekStart(new Date(), timezone, settings?.weekStartsOn ?? 1).start;
  const [goals, habits, logs, reviews] = await Promise.all([
    db.collection<GoalDocument>("goals").find({ userId, deletedAt: null }).sort({ targetDate: 1 }).toArray(),
    db.collection<HabitDocument>("habits").find({ userId, deletedAt: null }).sort({ createdAt: 1 }).toArray(),
    db.collection<HabitLogDocument>("habitLogs").find({ userId, deletedAt: null, date: { $gte: weekStart, $lte: day } }).sort({ date: -1 }).toArray(),
    db.collection<ReviewDocument>("reviews").find({ userId, deletedAt: null }).sort({ period: -1 }).limit(10).toArray(),
  ]);
  const weekDates = Array.from({ length: 7 }, (_, offset) => { const date = new Date(`${weekStart}T12:00:00.000Z`); date.setUTCDate(date.getUTCDate() + offset); return date.toISOString().slice(0, 10); });
  const habitActivity = weekDates.map(date => ({ label: new Intl.DateTimeFormat(settings?.locale ?? "en-RW", { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00.000Z`)), value: logs.filter(log => log.date === date && log.status === "DONE").length }));
  return <AppShell>
    <PageHeading title="Growth" description="Keep personal goals visible, build sustainable habits, and review the week with intention." />
    <div className="mb-5"><WeeklyBars title="Habit consistency" description="Completed habits by day this week." points={habitActivity} valueLabel="completions"/></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Surface>
        <h2 className="mb-4 font-display text-lg">Goals</h2>
        {goals.length ? <ul className="space-y-3">{goals.map(goal => <li key={goal._id!.toHexString()} className="rounded-xl border border-[var(--border)] p-3"><div className="flex justify-between gap-3"><p className="text-sm">{goal.title}</p><span className="text-[10px] text-[var(--grauzone)]">{goal.area}</span></div>{goal.why && <p className="mt-1 text-xs text-[var(--grauzone)]">{goal.why}</p>}{goal.targetDate && <p className="mt-2 text-[10px] text-[var(--grauzone)]">Target {goal.targetDate.toLocaleDateString()}</p>}</li>)}</ul> : <p className="text-sm text-[var(--grauzone)]">No active goals yet. Pick an area that matters.</p>}
        <details className="mt-5"><summary className="cursor-pointer text-sm text-[var(--strawberry)]">Add a goal</summary><div className="mt-4"><ActionForm action={createGoalAction}><Field label="Goal" name="title" required /><Field label="Area" name="area" required defaultValue="Personal" /><Field label="Why it matters" name="why"><textarea name="why" rows={3} className="mt-1.5 block w-full rounded-xl border border-[var(--border)] bg-[var(--ink)] px-3 py-2.5 text-sm" /></Field><Field label="Target date" name="targetDate" type="date" /></ActionForm></div></details>
      </Surface>
      <Surface>
        <h2 className="mb-4 font-display text-lg">Today’s habits</h2>
        {habits.length ? <ul className="space-y-4">{habits.map(habit => { const log = logs.find(item => item.habitId.equals(habit._id!) && item.date === day); return <li key={habit._id!.toHexString()} className="rounded-xl border border-[var(--border)] p-3"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-medium">{habit.name}<span className="ml-2 text-[10px] font-normal text-[var(--muted)]">{habit.cadence === "DAILY" ? "Daily" : `${habit.targetPerWeek} days / week`}</span></span><div className="flex gap-2">{(["DONE", "SKIPPED"] as const).map(status => <form key={status} action={async () => { "use server"; await logHabitAction(habit._id!.toHexString(), status); }}><button className={`min-h-10 rounded-lg border px-3 text-xs ${log?.status === status ? "border-[var(--strawberry)] text-[var(--strawberry)]" : "border-[var(--border-strong)] text-[var(--muted)]"}`}>{status === "DONE" ? "Done today" : "Skip today"}</button></form>)}</div></div><div className="mt-3 flex items-center gap-2" aria-label="Last seven days">{weekDates.map(date => { const logged = logs.find(item => item.habitId.equals(habit._id!) && item.date === date); return <span key={date} title={`${date}: ${logged?.status?.toLowerCase() ?? "not logged"}`} className={`grid size-6 place-items-center rounded-full border ${logged?.status === "DONE" ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success),transparent_82%)] text-[var(--success)]" : logged?.status === "SKIPPED" ? "border-[var(--warning)]/50 text-[var(--warning)]" : "border-[var(--border-strong)] text-[var(--muted)]"}`}>{logged?.status === "DONE" ? <Check size={12}/> : logged?.status === "SKIPPED" ? <Minus size={12}/> : <span className="size-1 rounded-full bg-current"/>}</span>; })}<span className="ml-1 text-[10px] text-[var(--muted)]">7-day rhythm</span></div></li>; })}</ul> : <p className="text-sm text-[var(--grauzone)]">No habits yet. Keep the first one small and repeatable.</p>}
        <details className="mt-5"><summary className="cursor-pointer text-sm text-[var(--strawberry)]">Create habit</summary><div className="mt-4"><ActionForm action={createHabitAction}><Field label="Habit" name="name" required /><Field label="Cadence" name="cadence"><select name="cadence" className="mt-1.5 block w-full rounded-xl border border-[var(--border)] bg-[var(--ink)] px-3 py-2.5 text-sm"><option value="DAILY">Daily</option><option value="WEEKLY">Weekly target</option></select></Field><Field label="Target days per week" name="targetPerWeek" type="number" defaultValue="7" /></ActionForm></div></details>
      </Surface>
      <Surface>
        <h2 className="mb-4 font-display text-lg">Weekly review</h2>
        <ActionForm action={createReviewAction}><Field label="Week (ISO date or week label)" name="period" required defaultValue={day} />{(["wins", "lessons", "obstacles", "nextFocus"] as const).map(field => <Field key={field} label={field === "nextFocus" ? "Next week’s focus" : field[0]!.toUpperCase() + field.slice(1)} name={field}><textarea name={field} rows={2} className="mt-1.5 block w-full rounded-xl border border-[var(--border)] bg-[var(--ink)] px-3 py-2.5 text-sm" /></Field>)}</ActionForm>
      </Surface>
      <Surface>
        <h2 className="mb-4 font-display text-lg">Saved reviews</h2>
        {reviews.length ? <ul className="space-y-3">{reviews.map(review => <li key={review._id!.toHexString()} className="rounded-xl border border-[var(--border)] p-3"><p className="text-sm">{review.period} · {review.type}</p><p className="mt-1 text-xs text-[var(--grauzone)]">{review.nextFocus || "No next focus saved."}</p></li>)}</ul> : <p className="text-sm text-[var(--grauzone)]">Your saved reviews will appear here.</p>}
      </Surface>
    </div>
  </AppShell>;
}
