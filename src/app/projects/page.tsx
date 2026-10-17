import { CircleDashed, Clock3, Flag, FolderKanban, Lightbulb, PauseCircle, PlayCircle, Plus, Sparkles } from "@/components/ui/icons";
import { ActionForm, Field } from "@/components/action-form";
import { AppShell, PageHeading } from "@/components/app-shell";
import { ProjectStatusButton } from "@/components/project-status-button";
import { ProjectNextAction } from "@/components/project-next-action";
import { createProjectAction } from "@/server/actions/core";
import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import type { ProjectDocument, SettingsDocument, TaskDocument } from "@/server/db/collections";
import type { LucideIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

const columns: { status: ProjectDocument["status"]; label: string; icon: LucideIcon }[] = [
  { status: "IDEA", label: "Backlog", icon: Lightbulb }, { status: "PLANNED", label: "Planned", icon: CircleDashed },
  { status: "ACTIVE", label: "Active", icon: PlayCircle }, { status: "PAUSED", label: "Paused", icon: PauseCircle },
  { status: "COMPLETED", label: "Completed", icon: Flag },
];

export default async function ProjectsPage() {
  const userId = await requireUserId(); const db = await getDatabase();
  const [projects, settings] = await Promise.all([
    db.collection<ProjectDocument>("projects").find({ userId, deletedAt: null }).sort({ updatedAt: -1 }).toArray(),
    db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }),
  ]);
  const tasks = projects.length ? await db.collection<TaskDocument>("tasks").find({ userId, projectId: { $in: projects.map(project => project._id!) }, deletedAt: null }).sort({ dueDate: 1 }).toArray() : [];
  const taskById = new Map(tasks.map(task => [task._id!.toHexString(), task]));
  const activeCount = projects.filter(project => project.status === "ACTIVE").length;
  return <AppShell>
    <PageHeading title="Projects" description="Keep ideas separate from commitments, give active work a next action, and protect your focus." actions={<details className="relative"><summary className="inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl bg-[var(--strawberry)] px-4 text-xs font-semibold text-[var(--ink)]"><Plus size={15}/> New project</summary><div className="absolute right-0 z-10 mt-2 w-[min(90vw,340px)] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-5 shadow-2xl"><h2 className="mb-4 font-display text-lg font-semibold">Start a project</h2><ActionForm action={createProjectAction}><Field label="Project name" name="title" required/><Field label="Starting point" name="status"><select name="status" className="form-control"><option value="IDEA">Backlog idea</option><option value="PLANNED">Planned commitment</option><option value="ACTIVE">Active work</option></select></Field><Field label="Priority" name="priority"><select name="priority" className="form-control"><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="LOW">Low</option></select></Field><Field label="Deadline" name="deadline" type="date"/></ActionForm></div></details>} />
    <div className="mb-5 flex flex-wrap gap-3"><SummaryPill icon={FolderKanban} label="PROJECTS" value={projects.length}/><SummaryPill icon={PlayCircle} label="ACTIVE" value={`${activeCount} / ${settings?.activeProjectLimit ?? 5}`}/><SummaryPill icon={Sparkles} label="NEXT ACTIONS" value={projects.filter(project=>project.status==="ACTIVE"&&project.nextActionTaskId).length}/></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {columns.map(column=>{const ColumnIcon=column.icon;const columnProjects=projects.filter(project=>project.status===column.status);return <section key={column.status} aria-label={`${column.label} projects`} className="min-h-64 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface-1),transparent_38%)] p-3"><header className="mb-3 flex items-center justify-between border-b border-[var(--border-strong)] px-1 pb-3"><div className="flex items-center gap-2"><ColumnIcon size={15} className="text-[var(--strawberry)]"/><h2 className="text-xs font-semibold">{column.label}</h2></div><span className="grid size-6 place-items-center rounded-lg border border-[var(--border-strong)] font-mono text-[10px] text-[var(--muted)]">{columnProjects.length}</span></header><div className="space-y-3">{columnProjects.map(project=>{const projectTasks=tasks.filter(task=>task.projectId?.equals(project._id!));const openTasks=projectTasks.filter(task=>task.status!=="DONE");const done=projectTasks.length-openTasks.length;const progress=projectTasks.length?Math.round(done/projectTasks.length*100):0;const next=project.nextActionTaskId?taskById.get(project.nextActionTaskId.toHexString()):undefined;return <article key={project._id!.toHexString()} className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-3.5 shadow-sm"><h3 className="text-xs font-semibold leading-5">{project.title}</h3><div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><Flag size={11}/>{project.priority.toLowerCase()} priority{project.deadline?` · ${project.deadline.toLocaleDateString()}`:""}</div>{project.status!=="IDEA"&&<><div className="mt-3 flex items-center justify-between text-[10px] text-[var(--muted)]"><span>{done} of {projectTasks.length} tasks complete</span><span className="font-mono">{progress}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-[var(--strawberry)]" style={{width:`${progress}%`}}/></div></>}{project.status==="ACTIVE"?<><p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-[var(--muted)]"><Clock3 size={12} className="mt-0.5 shrink-0 text-[var(--strawberry)]"/>{next?`Next: ${next.title}`:"Choose the next task."}</p><ProjectNextAction projectId={project._id!.toHexString()} currentTaskId={project.nextActionTaskId?.toHexString()??null} tasks={openTasks.map(task=>({id:task._id!.toHexString(),title:task.title}))}/></>:<p className="mt-3 text-[10px] text-[var(--muted)]">{projectTasks.length} linked tasks</p>}<div className="mt-3 border-t border-[var(--border)] pt-3"><ProjectStatusButton projectId={project._id!.toHexString()} status={project.status}/></div></article>})}{columnProjects.length===0&&<div className="grid min-h-20 place-items-center rounded-xl border border-dashed border-[var(--border)] px-3 text-center"><p className="text-[10px] text-[var(--muted)]">No {column.label.toLowerCase()} projects</p></div>}</div></section>})}
    </div>
  </AppShell>;
}

function SummaryPill({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) { return <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 py-2"><Icon size={14} className="text-[var(--strawberry)]"/><span className="font-mono text-[9px] tracking-wider text-[var(--muted)]">{label}</span><span className="text-xs font-semibold">{value}</span></div>; }
