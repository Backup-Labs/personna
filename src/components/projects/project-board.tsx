"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { Check, CircleDashed, Flag, Grip, Lightbulb, PauseCircle, PlayCircle, Search, Trash, Edit3 } from "@/components/ui/icons";
import { CustomSelect, Field } from "@/components/action-form";
import { ProjectNextAction } from "@/components/project-next-action";
import { ProjectStatusButton } from "@/components/project-status-button";
import { createProjectAction, deleteProjectAction, updateProjectAction, updateProjectStatusAction } from "@/server/actions/projects";
import type { ProjectDocument } from "@/server/db/collections";
import { ActionToast } from "@/components/action-toast";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { useNotify } from "@/components/feedback-provider";

type ProjectStatus = ProjectDocument["status"];
type ProjectPriority = ProjectDocument["priority"];
type ProjectTask = { id: string; title: string; status: string };
export type ProjectCardData = {
  id: string;
  title: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string | null;
  goalId: string | null;
  nextActionTaskId: string | null;
  updatedAt: number;
  tasks: ProjectTask[];
};
type GoalChoice = { id: string; title: string };
type Result = { ok: boolean; error?: string } | null;

const columns: { status: ProjectStatus; label: string; Icon: typeof Lightbulb }[] = [
  { status: "IDEA", label: "Backlog", Icon: Lightbulb },
  { status: "PLANNED", label: "Planned", Icon: CircleDashed },
  { status: "ACTIVE", label: "Active", Icon: PlayCircle },
  { status: "PAUSED", label: "Paused", Icon: PauseCircle },
  { status: "COMPLETED", label: "Completed", Icon: Flag },
];
const statusLabels: Record<ProjectStatus, string> = { IDEA: "Backlog", PLANNED: "Planned", ACTIVE: "Active", PAUSED: "Paused", COMPLETED: "Completed" };
const priorityRank: Record<ProjectPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function ProjectBoard({ projects, goals, activeLimit }: { projects: ProjectCardData[]; goals: GoalChoice[]; activeLimit: number }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"updated" | "deadline" | "priority" | "name">("updated");
  const [statusOverrides, setStatusOverrides] = useState<Partial<Record<string, ProjectStatus>>>({});
  const [visibleCounts, setVisibleCounts] = useState<Partial<Record<ProjectStatus, number>>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<ProjectStatus | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const notify = useNotify();

  useEffect(() => setStatusOverrides({}), [projects]);

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return projects
      .map(project => ({ ...project, status: statusOverrides[project.id] ?? project.status }))
      .filter(project => !normalizedQuery || `${project.title} ${project.priority} ${project.tasks.map(task => task.title).join(" ")}`.toLocaleLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        if (sort === "name") return a.title.localeCompare(b.title);
        if (sort === "priority") return priorityRank[a.priority] - priorityRank[b.priority] || a.title.localeCompare(b.title);
        if (sort === "deadline") return (a.deadline ?? "9999-12-31").localeCompare(b.deadline ?? "9999-12-31") || a.title.localeCompare(b.title);
        return b.updatedAt - a.updatedAt;
      });
  }, [projects, query, sort, statusOverrides]);

  function moveProject(projectId: string, status: ProjectStatus) {
    const original = projects.find(project => project.id === projectId)?.status;
    if (!original || original === status || pending) return;
    setMessage("");
    setStatusOverrides(current => ({ ...current, [projectId]: status }));
    startTransition(async () => {
      const result = await updateProjectStatusAction(projectId, status);
      if (!result.ok) {
        setStatusOverrides(current => ({ ...current, [projectId]: original }));
        setMessage(result.error ?? "Could not move the project.");
        notify("error", result.error ?? "Could not move the project.");
        return;
      }
      setMessage(`Moved to ${statusLabels[status]}.`);
      notify("success", `Project moved to ${statusLabels[status]}.`);
      router.refresh();
    });
  }

  return <div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <label className="relative block w-full max-w-sm">
        <span className="sr-only">Search projects</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"/>
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search projects or tasks" className="form-control pl-9"/>
      </label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)]">Sort</span>
        <div className="min-w-44"><CustomSelect name="projectSort" defaultValue="updated" onValueChange={value => setSort(value as typeof sort)}><option value="updated">Recently updated</option><option value="deadline">Deadline</option><option value="priority">Priority</option><option value="name">Name</option></CustomSelect></div>
      </div>
    </div>
    <p className="mb-3 text-xs text-[var(--muted)]">Drag a project to change its status. Use Edit for keyboard accessible status changes. {projects.length} projects · {activeLimit} active project limit.</p>
    {message && <p className="mb-3 text-xs text-[var(--muted)]" role="status" aria-live="polite">{message}</p>}
    <div className="grid grid-flow-col auto-cols-[minmax(250px,84vw)] gap-3 overflow-x-auto pb-4 sm:auto-cols-[minmax(260px,1fr)] lg:grid-flow-row lg:grid-cols-5 lg:auto-cols-auto lg:overflow-visible">
      {columns.map(({ status, label, Icon }) => {
        const items = visibleProjects.filter(project => project.status === status);
        const isOver = dragOver === status;
        return <section key={status} aria-label={`${label} projects`} onDragOver={event => { event.preventDefault(); setDragOver(status); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOver(null); }} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain") || draggedId; if (id) moveProject(id, status); setDraggedId(null); setDragOver(null); }} className={`min-h-64 rounded-2xl border p-3 transition-colors ${isOver ? "border-[var(--strawberry)] bg-[color-mix(in_srgb,var(--strawberry),transparent_94%)]" : "border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface-1),transparent_38%)]"}`}>
          <header className="mb-3 flex items-center justify-between px-1 pb-3">
            <div className="flex items-center gap-2"><Icon size={15} className="text-[var(--strawberry)]"/><h2 className="text-xs font-semibold">{label}</h2></div>
            <span className="grid size-6 place-items-center rounded-lg bg-[var(--surface-2)] font-mono text-[10px] text-[var(--muted)]">{items.length}</span>
          </header>
          <div className="space-y-3">
            {items.slice(0, visibleCounts[status] ?? 20).map(project => <ProjectCard key={project.id} project={project} goals={goals} pending={pending} onMove={moveProject} onDragStart={() => setDraggedId(project.id)} onDragEnd={() => { setDraggedId(null); setDragOver(null); }}/>) }
            {items.length === 0 && <div className={`grid min-h-24 place-items-center rounded-xl border border-dashed px-3 text-center ${isOver ? "border-[var(--strawberry)]" : "border-[var(--border)]"}`}><p className="text-[10px] text-[var(--muted)]">{query ? "No matching projects" : `No ${label.toLowerCase()} projects`}</p></div>}
            {items.length > (visibleCounts[status] ?? 20) && <button type="button" onClick={() => setVisibleCounts(current => ({ ...current, [status]: (current[status] ?? 20) + 20 }))} className="min-h-9 w-full rounded-lg text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--tan)]">Show 20 more · {items.length - (visibleCounts[status] ?? 20)} remaining</button>}
          </div>
        </section>;
      })}
    </div>
  </div>;
}

function ProjectCard({ project, goals, pending, onMove, onDragStart, onDragEnd }: { project: ProjectCardData; goals: GoalChoice[]; pending: boolean; onMove: (id: string, status: ProjectStatus) => void; onDragStart: () => void; onDragEnd: () => void }) {
  const openTasks = project.tasks.filter(task => task.status !== "DONE");
  const done = project.tasks.length - openTasks.length;
  const progress = project.tasks.length ? Math.round(done / project.tasks.length * 100) : 0;
  const next = project.tasks.find(task => task.id === project.nextActionTaskId);
  return <article draggable onDragStart={event => { if (event.target instanceof Element && event.target.closest("button,input,summary,select,textarea,a")) { event.preventDefault(); return; } event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", project.id); onDragStart(); }} onDragEnd={onDragEnd} className={`rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-3.5 shadow-sm transition ${pending ? "opacity-70" : "hover:border-[var(--strawberry)]"} ${project.status === "COMPLETED" ? "opacity-75" : ""}`}>
    <div className="flex items-start justify-between gap-2"><h3 className="min-w-0 flex-1 text-xs font-semibold leading-5">{project.title}</h3><span className="cursor-grab text-[var(--muted)]" aria-label="Drag project to move status" title="Drag to move"><Grip size={14}/></span></div>
    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><Flag size={11}/>{project.priority.toLowerCase()} priority{project.deadline ? ` · ${new Date(`${project.deadline}T12:00:00`).toLocaleDateString()}` : ""}</div>
    {project.status !== "IDEA" && <><div className="mt-3 flex items-center justify-between text-[10px] text-[var(--muted)]"><span>{done} of {project.tasks.length} tasks complete</span><span className="font-mono">{progress}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-[var(--strawberry)] transition-[width]" style={{ width: `${progress}%` }}/></div></>}
    {project.status === "ACTIVE" ? <><p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-[var(--muted)]"><Flag size={12} className="mt-0.5 shrink-0 text-[var(--strawberry)]"/>{next ? `Next: ${next.title}` : "Choose the next task."}</p><ProjectNextAction projectId={project.id} currentTaskId={project.nextActionTaskId} tasks={openTasks.map(task => ({ id: task.id, title: task.title }))}/></> : <p className="mt-3 text-[10px] text-[var(--muted)]">{project.tasks.length} linked tasks</p>}
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
      <details className="relative"><summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1 rounded-lg border border-[var(--border-strong)] px-2.5 text-[10px] font-semibold hover:border-[var(--strawberry)]"><Edit3 size={12}/>Edit</summary><div className="absolute left-0 top-full z-20 mt-2 w-[min(86vw,320px)] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-4 shadow-2xl"><h4 className="mb-3 text-sm font-semibold">Edit project</h4><ProjectEditForm project={project} goals={goals}/></div></details>
      <ProjectStatusButton projectId={project.id} status={project.status}/>
      <DeleteProjectButton projectId={project.id} title={project.title}/>
      {project.status !== "COMPLETED" && <button type="button" disabled={pending} onClick={() => onMove(project.id, "COMPLETED")} className="ml-auto inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-[10px] text-[var(--muted)] hover:text-[var(--success)] disabled:opacity-50" title="Mark complete"><Check size={12}/>Complete</button>}
    </div>
  </article>;
}

function ProjectEditForm({ project, goals }: { project: ProjectCardData; goals: GoalChoice[] }) {
  const [state, action, pending] = useActionState(async (_previous: Result, form: FormData) => updateProjectAction(project.id, form), null);
  return <form action={action} className="space-y-3">
    <Field label="Project name" name="title" required defaultValue={project.title}/>
    <Field label="Status" name="status" required defaultValue={project.status}><select name="status" defaultValue={project.status}><option value="IDEA">Backlog</option><option value="PLANNED">Planned</option><option value="ACTIVE">Active</option><option value="PAUSED">Paused</option><option value="COMPLETED">Completed</option></select></Field>
    <Field label="Priority" name="priority" required defaultValue={project.priority}><select name="priority" defaultValue={project.priority}><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></Field>
    <Field label="Deadline" name="deadline" type="date" defaultValue={project.deadline ?? ""}/>
    <Field label="Linked goal" name="goalId" defaultValue={project.goalId ?? ""}><select name="goalId" defaultValue={project.goalId ?? ""}><option value="">No linked goal</option>{goals.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select></Field>
    <ActionToast result={state} successMessage="Project changes saved."/>{state && !state.ok && <p className="text-xs text-[var(--danger)]" role="alert">{state.error}</p>}{state?.ok && <p className="text-xs text-[var(--success)]" role="status">Changes saved.</p>}
    <button type="submit" disabled={pending} className="min-h-9 rounded-lg bg-[var(--strawberry)] px-3 text-xs font-semibold text-[var(--ink)] disabled:cursor-wait disabled:opacity-60">{pending ? "Saving…" : "Save changes"}</button>
  </form>;
}

function DeleteProjectButton({ projectId, title }: { projectId: string; title: string }) {
  const [state, action, pending] = useActionState(async (previous: Result, form: FormData) => {
    void previous;
    void form;
    return deleteProjectAction(projectId);
  }, null);
  return <form action={action} className="ml-auto flex items-center gap-2">
    <ActionToast result={state} successMessage="Project removed."/>
    {state && !state.ok && <span role="alert" className="max-w-36 text-[10px] text-[var(--danger)]">{state.error}</span>}
    <ConfirmSubmitButton disabled={pending} title={`Remove “${title}”?`} description="Linked tasks, notes, time, and finance records will be kept without the project link." confirmLabel="Remove project" className="grid size-8 cursor-pointer place-items-center rounded-lg text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--danger),transparent_90%)] hover:text-[var(--danger)] disabled:opacity-50"><Trash size={13}/></ConfirmSubmitButton>
  </form>;
}

export function CreateProjectForm({ goals }: { goals: GoalChoice[] }) {
  const [state, action, pending] = useActionState(async (_previous: Result, form: FormData) => createProjectAction(form), null);
  return <form action={action} className="space-y-3">
    <Field label="Project name" name="title" required/>
    <Field label="Starting point" name="status"><select name="status" defaultValue="PLANNED"><option value="IDEA">Backlog idea</option><option value="PLANNED">Planned commitment</option><option value="ACTIVE">Active work</option></select></Field>
    <Field label="Priority" name="priority"><select name="priority" defaultValue="MEDIUM"><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="LOW">Low</option></select></Field>
    <Field label="Deadline" name="deadline" type="date"/>
    <Field label="Linked goal" name="goalId"><select name="goalId" defaultValue=""><option value="">No linked goal</option>{goals.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select></Field>
    <ActionToast result={state} successMessage="Project created."/>{state && !state.ok && <p className="text-xs text-[var(--danger)]" role="alert">{state.error}</p>}{state?.ok && <p className="text-xs text-[var(--success)]" role="status">Project created.</p>}
    <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-[var(--strawberry)] px-4 text-sm font-semibold text-[var(--ink)] disabled:cursor-wait disabled:opacity-60">{pending ? "Creating…" : "Create project"}</button>
  </form>;
}
