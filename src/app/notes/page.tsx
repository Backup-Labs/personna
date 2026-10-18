import { FileText, Lightbulb, NotebookPen, Search, Tag } from "@/components/ui/icons";
import { ActionForm, Field } from "@/components/action-form";
import { AppShell, PageHeading, Surface } from "@/components/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { NoteDeleteButton } from "@/components/note-delete-button";
import { createNoteAction, updateNoteAction } from "@/server/actions/core";
import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import type { NoteDocument } from "@/server/db/collections";

export const dynamic = "force-dynamic";

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q }, userId] = await Promise.all([searchParams, requireUserId()]);
  const search = q?.trim().slice(0, 100) ?? "";
  const notes = await (await getDatabase()).collection<NoteDocument>("notes")
    .find({ userId, deletedAt: null, ...(search ? { $text: { $search: search } } : {}) })
    .sort({ updatedAt: -1 }).limit(60).toArray();

  return (
    <AppShell>
      <PageHeading title="Notes" description="Capture ideas and decisions, then find them again when the work needs them." actions={<a href="#capture-note" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--strawberry)] px-4 text-xs font-semibold text-[var(--ink)]"><NotebookPen size={16}/>Capture note</a>}/>
      <div className="grid gap-5 xl:grid-cols-12">
        <Surface className="xl:col-span-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><p className="metric-label"><FileText size={14}/> LIBRARY</p><h2 className="mt-1 font-display text-lg font-semibold">Recent notes</h2></div>
            <span className="rounded-full border border-[var(--border-strong)] px-2.5 py-1 font-mono text-[10px] text-[var(--muted)]">{notes.length}{search ? " matches" : " shown"}</span>
          </div>
          <form action="/notes" className="mb-4 flex gap-2">
            <label className="sr-only" htmlFor="note-search">Search notes</label>
            <div className="relative min-w-0 flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"/><input id="note-search" name="q" defaultValue={search} placeholder="Search titles, notes, and tags" className="form-control mt-0 pl-9"/></div>
            <button className="min-h-11 rounded-xl border border-[var(--border-strong)] px-4 text-xs font-semibold">Search</button>
          </form>
          {notes.length ? (
            <ul className="divide-y divide-[var(--border)]">
              {notes.map(note => {
                const noteId = note._id!.toHexString();
                return (
                  <li key={noteId} className="py-4 first:pt-1">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--strawberry)]">{note.type === "IDEA" ? <Lightbulb size={17}/> : <FileText size={17}/>}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{note.title}</h3><span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[9px] text-[var(--muted)]">{note.type}</span>{note.inbox && <span className="rounded-full border border-[var(--warning)]/40 px-2 py-0.5 text-[9px] text-[var(--warning)]">Inbox</span>}</div>
                        {note.body && <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-[var(--muted)]">{note.body}</p>}
                        {note.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{note.tags.map(tag => <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2 py-1 text-[9px] text-[var(--muted)]"><Tag size={10}/>{tag}</span>)}</div>}
                      </div>
                      <NoteDeleteButton noteId={noteId}/>
                    </div>
                    <details className="relative ml-12 mt-2">
                      <summary className="inline-flex min-h-8 cursor-pointer list-none items-center rounded-lg px-2 text-xs text-[var(--muted)] hover:bg-[var(--surface-2)]">Edit note</summary>
                      <div className="absolute left-0 z-20 mt-2 w-[min(88vw,420px)] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-4 shadow-xl">
                        <ActionForm action={updateNoteAction.bind(null, noteId)} submitLabel="Save changes">
                          <Field label="Title" name="title" required defaultValue={note.title}/>
                          <Field label="Type" name="type"><select name="type" defaultValue={note.type}><option value="NOTE">Note</option><option value="IDEA">Idea</option><option value="DECISION">Decision</option><option value="MEETING">Meeting</option><option value="LINK">Link</option></select></Field>
                          <Field label="Note" name="body"><textarea name="body" rows={6} defaultValue={note.body} className="form-control"/></Field>
                          <Field label="Inbox" name="inbox"><select name="inbox" defaultValue={note.inbox ? "true" : "false"}><option value="true">Keep in inbox</option><option value="false">Archive from inbox</option></select></Field>
                        </ActionForm>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          ) : <EmptyState icon={NotebookPen} title={search ? "No notes match that search" : "Your notes start here"} description={search ? "Try a shorter phrase or search a different term." : "Save a useful thought, decision, or link before it gets lost."} href={search ? "/notes" : "#capture-note"} action={search ? "Clear search" : "Capture a note"}/>}
        </Surface>
        <Surface id="capture-note" className="h-fit xl:col-span-4">
          <div className="mb-4"><p className="metric-label"><Lightbulb size={14}/> QUICK CAPTURE</p><h2 className="mt-1 font-display text-lg font-semibold">Capture a note</h2><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Add just enough detail to find this thought later.</p></div>
          <ActionForm action={createNoteAction}><Field label="Title" name="title" required/><Field label="Type" name="type"><select name="type"><option value="NOTE">Note</option><option value="IDEA">Idea</option><option value="DECISION">Decision</option><option value="MEETING">Meeting</option><option value="LINK">Link</option></select></Field><Field label="Note" name="body"><textarea name="body" rows={6} className="form-control"/></Field></ActionForm>
        </Surface>
      </div>
    </AppShell>
  );
}