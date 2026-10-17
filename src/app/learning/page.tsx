import { BookOpen, CircleCheck, LibraryBig } from "@/components/ui/icons";
import { ActionForm, Field } from "@/components/action-form";
import { AppShell, PageHeading, Surface } from "@/components/app-shell";
import { LearningProgress } from "@/components/learning-progress";
import { createLearningItemAction } from "@/server/actions/core";
import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import type { LearningItemDocument } from "@/server/db/collections";

export const dynamic = "force-dynamic";

export default async function LearningPage() {
  const userId = await requireUserId();
  const items = await (await getDatabase()).collection<LearningItemDocument>("learningItems").find({ userId, deletedAt: null }).sort({ updatedAt: -1 }).toArray();
  const completed = items.filter(item => item.progress === 100).length;
  const inProgress = items.filter(item => item.progress > 0 && item.progress < 100).length;
  return <AppShell>
    <PageHeading title="Learning" description="Keep courses, books, subjects, and other learning commitments connected to your goals." />
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      {[{ label: "Resources", value: items.length, Icon: LibraryBig }, { label: "In progress", value: inProgress, Icon: BookOpen }, { label: "Completed", value: completed, Icon: CircleCheck }].map(({ label, value, Icon }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-4"><Icon className="size-5 text-[var(--strawberry)]"/><div><p className="text-xl font-semibold">{value}</p><p className="text-xs text-[var(--grauzone)]">{label}</p></div></div>)}
    </div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Surface><h2 className="mb-4 font-display text-lg">Learning roadmap</h2>{items.length ? <ul className="space-y-3">{items.map(item => <li key={item._id!.toHexString()} className="rounded-xl border border-[var(--border-strong)] p-3"><div className="flex justify-between gap-3 text-sm"><span>{item.title}</span><span className="text-xs text-[var(--grauzone)]">{item.type} · {item.status.replaceAll("_", " ")}</span></div><div className="mt-3 h-1.5 rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-[var(--strawberry)]" style={{ width: `${item.progress}%` }}/></div><p className="mt-1 text-right text-[10px] text-[var(--grauzone)]">{item.progress}% complete</p><LearningProgress itemId={item._id!.toHexString()} progress={item.progress}/></li>)}</ul> : <p className="text-sm text-[var(--grauzone)]">Add one learning resource to start your roadmap.</p>}</Surface>
      <Surface><h2 className="mb-4 font-display text-lg">Add resource</h2><ActionForm action={createLearningItemAction}><Field label="Title" name="title" required/><Field label="Type" name="type"><select name="type" className="form-control"><option value="COURSE">Course</option><option value="BOOK">Book</option><option value="VIDEO">Video</option><option value="ARTICLE">Article</option><option value="SUBJECT">Subject</option></select></Field></ActionForm></Surface>
    </div>
  </AppShell>;
}
