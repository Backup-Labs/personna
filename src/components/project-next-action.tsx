"use client";
import { useActionState } from "react";
import { ArrowRight, Check } from "@/components/ui/icons";
import { CustomSelect } from "@/components/action-form";
import { setProjectNextActionAction } from "@/server/actions/core";

type Candidate = { id: string; title: string };
type Result = { ok: boolean; error?: string } | null;
export function ProjectNextAction({ projectId, currentTaskId, tasks }: { projectId: string; currentTaskId: string | null; tasks: Candidate[] }) {
  const [state, action, pending] = useActionState(async (_previous: Result, data: FormData): Promise<{ok:boolean;error?:string}> => { const taskId=String(data.get("taskId")??"");const result=await setProjectNextActionAction(projectId,taskId);return result.ok?{ok:true}:{ok:false,error:result.error}; }, null);
  if (!tasks.length) return <p className="mt-3 text-[10px] leading-4 text-[var(--muted)]">Add an unfinished task to this project before choosing its next action.</p>;
  return <form action={action} className="mt-3 space-y-2"><label className="block text-xs text-[var(--muted)]">Next action<CustomSelect name="taskId" defaultValue={currentTaskId??""}><option value="" disabled>Choose next action</option>{tasks.map(task=><option key={task.id} value={task.id}>{task.title}</option>)}</CustomSelect></label><button disabled={pending} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--strawberry)] disabled:opacity-60">{state?.ok?<><Check size={12}/>Saved</>:<>Set next action<ArrowRight size={12}/></>}</button>{state&&!state.ok&&<p role="alert" className="text-[10px] text-[var(--danger)]">{state.error}</p>}</form>;
}
