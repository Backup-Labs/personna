import { CalendarClock, CheckCheck, CircleAlert, ListTodo, Plus, Star } from "@/components/ui/icons";
import { ActionForm, Field } from "@/components/action-form";
import { AppShell, PageHeading, Surface } from "@/components/app-shell";
import { SectionHeader } from "@/components/patterns/section-header";
import { StatTile } from "@/components/ui/stat-tile";
import { CompleteTaskButton, DeleteTaskButton, TopTaskButton } from "@/components/task-controls";
import { createTaskAction, updateTaskAction } from "@/server/actions/core";
import { getDatabase } from "@/lib/db";
import { fromZonedLocalDate, localDateKey } from "@/lib/dates";
import { requireUserId } from "@/server/authenticated-user";
import type { GoalDocument, ProjectDocument, SettingsDocument, TaskDocument } from "@/server/db/collections";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const userId = await requireUserId();
  const db = await getDatabase();
  const [tasks, projects, goals, settings] = await Promise.all([
    db.collection<TaskDocument>("tasks").find({ userId, deletedAt: null }).sort({ dueDate: 1, createdAt: -1 }).limit(150).toArray(),
    db.collection<ProjectDocument>("projects").find({ userId, deletedAt: null, status: { $ne: "IDEA" } }).sort({ title: 1 }).toArray(),
    db.collection<GoalDocument>("goals").find({ userId, deletedAt: null, status: "ACTIVE" }).sort({ title: 1 }).toArray(),
    db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }),
  ]);
  const timezone = settings?.timezone ?? "Africa/Kigali";
  const locale = settings?.locale ?? "en-RW";
  const today = localDateKey(new Date(), timezone);
  const todayStart = fromZonedLocalDate(today, timezone);
  const tomorrowKeyDate = new Date(`${today}T00:00:00.000Z`);
  tomorrowKeyDate.setUTCDate(tomorrowKeyDate.getUTCDate() + 1);
  const tomorrowStart = fromZonedLocalDate(tomorrowKeyDate.toISOString().slice(0, 10), timezone);
  const projectNames = new Map(projects.map(project => [project._id!.toHexString(), project.title]));
  const open = tasks.filter(task => task.status !== "DONE");
  const completed = tasks.filter(task => task.status === "DONE");
  const top = open.filter(task => task.isTop3Today).length;
  const groups = [
    { title: "Overdue", icon: CircleAlert, tasks: open.filter(task => task.dueDate && task.dueDate < todayStart), empty: "Nothing overdue. Keep that breathing room." },
    { title: "Today", icon: CalendarClock, tasks: open.filter(task => task.dueDate && task.dueDate >= todayStart && task.dueDate < tomorrowStart), empty: "No dated tasks for today." },
    { title: "Upcoming", icon: CalendarClock, tasks: open.filter(task => task.dueDate && task.dueDate >= tomorrowStart), empty: "No upcoming deadlines yet." },
    { title: "No date", icon: ListTodo, tasks: open.filter(task => !task.dueDate), empty: "Everything has a date or is in the completed list." },
  ];
  return <AppShell>
    <PageHeading title="Tasks" description="Capture commitments, keep your Top 3 focused, and make the next action clear." actions={<a href="#new-task" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--strawberry)] px-4 text-xs font-semibold text-[var(--ink)]"><Plus size={15}/>New task</a>}/>
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><StatTile label="Open tasks" value={open.length} detail="Across your task list" icon={ListTodo}/><StatTile label="Top priorities" value={`${top} / 3`} detail="Chosen for today" icon={Star}/><StatTile label="Completed" value={completed.length} detail="In the current list" icon={CheckCheck}/></div>
    <div className="grid gap-5 xl:grid-cols-12"><Surface className="xl:col-span-8"><div className="mb-4"><p className="metric-label"><ListTodo size={14}/> COMMITMENTS</p><h2 className="mt-1 font-display text-lg font-semibold">Your task list</h2></div>{open.length ? <div className="space-y-6">{groups.map(group => <section key={group.title}><SectionHeader title={`${group.title} · ${group.tasks.length}`}/>{group.tasks.length ? <ul className="divide-y divide-[var(--border)]">{group.tasks.map(task => <TaskRow key={task._id!.toHexString()} task={task} projectName={task.projectId ? projectNames.get(task.projectId.toHexString()) : undefined} locale={locale} timezone={timezone}/>)}</ul> : <p className="py-3 text-xs text-[var(--muted)]">{group.empty}</p>}</section>)}</div> : <div className="rounded-2xl border border-dashed border-[var(--border-strong)] p-8 text-center"><CheckCheck className="mx-auto size-6 text-[var(--success)]"/><p className="mt-3 text-sm font-semibold">Your list is clear</p><p className="mt-1 text-xs text-[var(--muted)]">Capture a task when something needs your attention.</p></div>}{completed.length > 0 && <details className="mt-6 border-t border-[var(--border)] pt-4"><summary className="cursor-pointer text-xs font-semibold text-[var(--muted)]">Completed ({completed.length})</summary><ul className="mt-2 divide-y divide-[var(--border)]">{completed.slice(0, 20).map(task => <TaskRow key={task._id!.toHexString()} task={task} projectName={task.projectId ? projectNames.get(task.projectId.toHexString()) : undefined} locale={locale} timezone={timezone}/>)}</ul></details>}</Surface>
      <Surface id="new-task" className="h-fit xl:col-span-4"><div className="mb-4"><p className="metric-label"><Plus size={14}/> QUICK CAPTURE</p><h2 className="mt-1 font-display text-lg font-semibold">New task</h2><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Title is the only required detail. Organize the rest when you have a moment.</p></div><ActionForm action={createTaskAction} submitLabel="Capture task"><Field label="Task title" name="title" required/><Field label="Notes" name="notes"><textarea name="notes" rows={3} className="form-control"/></Field><Field label="Priority" name="priority"><select name="priority" className="form-control"><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="LOW">Low</option></select></Field><Field label="Project" name="projectId"><select name="projectId" className="form-control"><option value="">No project yet</option>{projects.map(project => <option key={project._id!.toHexString()} value={project._id!.toHexString()}>{project.title}</option>)}</select></Field><Field label="Goal" name="goalId"><select name="goalId" className="form-control"><option value="">No goal yet</option>{goals.map(goal => <option key={goal._id!.toHexString()} value={goal._id!.toHexString()}>{goal.title}</option>)}</select></Field><Field label="Due date" name="dueDate" type="date"/></ActionForm></Surface>
    </div>
  </AppShell>;
}

function TaskRow({ task, projectName, locale, timezone }: { task: TaskDocument; projectName?: string; locale: string; timezone: string }) {
  const done = task.status === "DONE";
  const taskId = task._id!.toHexString();
  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <CompleteTaskButton taskId={taskId} done={done}/>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-medium ${done ? "text-[var(--muted)] line-through" : ""}`}>{task.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[var(--muted)]">
            <span className={`rounded-full border px-2 py-0.5 ${task.priority === "HIGH" ? "border-[var(--warning)]/60 text-[var(--warning)]" : "border-[var(--border)]"}`}>{task.priority.toLowerCase()}</span>
            <span>{task.status.toLowerCase()}</span>
            {projectName && <span>{projectName}</span>}
            {task.dueDate && <span className="inline-flex items-center gap-1"><CalendarClock size={11}/>{task.dueDate.toLocaleDateString(locale, { timeZone: timezone })}</span>}
          </div>
        </div>
        {!done && <TopTaskButton taskId={taskId} selected={task.isTop3Today}/>}
        <DeleteTaskButton taskId={taskId}/>
        <details className="relative">
          <summary className="grid size-8 cursor-pointer list-none place-items-center rounded-lg text-[10px] text-[var(--muted)] hover:bg-[var(--surface-2)]">Edit</summary>
          <div className="absolute right-0 z-20 mt-2 w-[min(88vw,360px)] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-4 shadow-xl">
            <ActionForm action={updateTaskAction.bind(null, taskId)} submitLabel="Save changes">
              <input type="hidden" name="projectId" value={task.projectId?.toHexString() ?? ""}/>
              <input type="hidden" name="goalId" value={task.goalId?.toHexString() ?? ""}/>
              <Field label="Task title" name="title" required defaultValue={task.title}/>
              <Field label="Notes" name="notes"><textarea name="notes" rows={3} defaultValue={task.notes} className="form-control"/></Field>
              <Field label="Priority" name="priority"><select name="priority" defaultValue={task.priority} className="form-control"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></Field>
              <Field label="Due date" name="dueDate" type="date" defaultValue={task.dueDate ? localDateKey(task.dueDate, timezone) : ""}/>
            </ActionForm>
          </div>
        </details>
      </div>
    </li>
  );
}