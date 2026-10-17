"use client";
import { useActionState } from "react";
import { Check, Circle, Star } from "@/components/ui/icons";
import { setTaskStatusAction, setTopTaskAction } from "@/server/actions/core";

function normalize(result: { ok: true } | { ok: false; error: string }) { return result.ok ? { ok: true } : { ok: false, error: result.error }; }

export function CompleteTaskButton({ taskId, done }: { taskId: string; done: boolean }) {
  const [state, action, pending] = useActionState(async () => normalize(await setTaskStatusAction(taskId, done ? "TODO" : "DONE")), null);
  return <form action={action} className="flex flex-col items-center"><button disabled={pending} aria-label={done ? "Reopen task" : "Complete task"} title={done ? "Reopen task" : "Complete task"} className={`grid size-8 place-items-center rounded-lg border transition ${done ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success),transparent_86%)] text-[var(--success)]" : "border-[var(--border-strong)] text-[var(--muted)] hover:border-[var(--success)] hover:text-[var(--success)]"}`}><Check size={15}/></button>{state && !state.ok && <span role="alert" className="mt-1 max-w-36 text-center text-[9px] text-[var(--danger)]">{state.error}</span>}</form>;
}

export function TopTaskButton({ taskId, selected }: { taskId: string; selected: boolean }) {
  const [state, action, pending] = useActionState(async () => normalize(await setTopTaskAction(taskId, !selected)), null);
  return <form action={action} className="flex flex-col items-center"><button disabled={pending} aria-label={selected ? "Remove from today's priorities" : "Add to today's priorities"} title={selected ? "Remove from today" : "Add to today"} className={`grid size-8 place-items-center rounded-lg border transition ${selected ? "border-[var(--strawberry)] bg-[color-mix(in_srgb,var(--strawberry),transparent_88%)] text-[var(--strawberry)]" : "border-[var(--border-strong)] text-[var(--muted)] hover:border-[var(--strawberry)] hover:text-[var(--strawberry)]"}`}><Star size={15} fill={selected ? "currentColor" : "none"}/></button>{state && !state.ok && <span role="alert" className="mt-1 max-w-36 text-center text-[9px] text-[var(--danger)]">{state.error}</span>}</form>;
}

export function TaskStatusIcon({ done }: { done: boolean }) { return done ? <Check size={14}/> : <Circle size={14}/>; }
