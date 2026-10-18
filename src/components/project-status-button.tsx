"use client";
import { useActionState } from "react";
import { Play, Pause } from "@/components/ui/icons";
import { updateProjectStatusAction } from "@/server/actions/projects";
import type { ProjectDocument } from "@/server/db/collections";

export function ProjectStatusButton({ projectId, status }: { projectId: string; status: ProjectDocument["status"] }) {
  const target: ProjectDocument["status"] = status === "ACTIVE" ? "PAUSED" : status === "COMPLETED" ? "COMPLETED" : "ACTIVE";
  const [state, action, pending] = useActionState(async (): Promise<{ok:boolean;error?:string}> => { const result = await updateProjectStatusAction(projectId, target); return result.ok ? {ok:true} : {ok:false,error:result.error}; }, null);
  if (status === "COMPLETED") return null;
  return <form action={action} className="flex flex-col items-start"><button disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] px-2.5 py-1.5 text-[10px] font-semibold hover:border-[var(--strawberry)] disabled:opacity-60">{status === "ACTIVE" ? <><Pause size={12}/>Pause</> : <><Play size={12}/>{status === "IDEA" ? "Promote to active" : "Activate"}</>}</button>{state && !state.ok && <span role="alert" className="mt-1 max-w-48 text-[10px] text-[var(--danger)]">{state.error}</span>}</form>;
}
