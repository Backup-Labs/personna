import { FolderKanban, PlayCircle, Sparkles, Plus } from "@/components/ui/icons";
import { AppShell, PageHeading } from "@/components/app-shell";
import { CreateProjectForm, ProjectBoard } from "@/components/projects/project-board";
import type { ProjectCardData } from "@/components/projects/project-board";
import { getDatabase } from "@/lib/db";
import { localDateKey } from "@/lib/dates";
import { requireUserId } from "@/server/authenticated-user";
import type { GoalDocument, ProjectDocument, SettingsDocument, TaskDocument } from "@/server/db/collections";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const userId = await requireUserId();
  const db = await getDatabase();
  const [projects, settings, goals] = await Promise.all([
    db.collection<ProjectDocument>("projects").find({ userId, deletedAt: null }).sort({ updatedAt: -1 }).limit(500).toArray(),
    db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null }),
    db.collection<GoalDocument>("goals").find({ userId, deletedAt: null, status: "ACTIVE" }).sort({ targetDate: 1 }).limit(200).toArray(),
  ]);
  const tasks = projects.length ? await db.collection<TaskDocument>("tasks").find({ userId, projectId: { $in: projects.map(project => project._id!) }, deletedAt: null }).sort({ dueDate: 1 }).limit(5000).toArray() : [];
  const tasksByProject = new Map<string, TaskDocument[]>();
  for (const task of tasks) {
    if (!task.projectId) continue;
    const key = task.projectId.toHexString();
    const group = tasksByProject.get(key) ?? [];
    group.push(task);
    tasksByProject.set(key, group);
  }
  const timezone = settings?.timezone ?? "Africa/Kigali";
  const projectData: ProjectCardData[] = projects.map(project => {
    const id = project._id!.toHexString();
    const linkedTasks = tasksByProject.get(id) ?? [];
    return {
      id,
      title: project.title,
      status: project.status,
      priority: project.priority,
      deadline: project.deadline ? localDateKey(project.deadline, timezone) : null,
      goalId: project.goalId?.toHexString() ?? null,
      nextActionTaskId: project.nextActionTaskId?.toHexString() ?? null,
      updatedAt: project.updatedAt.getTime(),
      tasks: linkedTasks.map(task => ({ id: task._id!.toHexString(), title: task.title, status: task.status })),
    };
  });
  const activeCount = projects.filter(project => project.status === "ACTIVE").length;
  const nextActionCount = projects.filter(project => project.status === "ACTIVE" && project.nextActionTaskId).length;

  return <AppShell>
    <PageHeading title="Projects" description="Move ideas into focused work, set a clear next action, and track progress from start to finish." actions={<details className="relative"><summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl bg-[var(--strawberry)] px-4 text-xs font-semibold text-[var(--ink)]"><Plus size={15}/>New project</summary><div className="absolute right-0 z-30 mt-2 w-[min(90vw,360px)] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-5 shadow-2xl"><h2 className="mb-4 font-display text-lg font-semibold">Start a project</h2><CreateProjectForm goals={goals.map(goal => ({ id: goal._id!.toHexString(), title: goal.title }))}/></div></details>}/>
    <div className="mb-5 flex flex-wrap gap-3">
      <SummaryPill icon={FolderKanban} label="PROJECTS" value={projects.length}/>
      <SummaryPill icon={PlayCircle} label="ACTIVE" value={`${activeCount} / ${settings?.activeProjectLimit ?? 5}`}/>
      <SummaryPill icon={Sparkles} label="NEXT ACTIONS" value={nextActionCount}/>
      {projects.length >= 500 && <p className="self-center text-xs text-[var(--warning)]">Showing the 500 most recently updated projects.</p>}
    </div>
    <ProjectBoard projects={projectData} activeLimit={settings?.activeProjectLimit ?? 5} goals={goals.map(goal => ({ id: goal._id!.toHexString(), title: goal.title }))}/>
  </AppShell>;
}

function SummaryPill({ icon: Icon, label, value }: { icon: typeof FolderKanban; label: string; value: string | number }) {
  return <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 py-2"><Icon size={14} className="text-[var(--strawberry)]"/><span className="font-mono text-[9px] tracking-wider text-[var(--muted)]">{label}</span><span className="text-xs font-semibold">{value}</span></div>;
}
