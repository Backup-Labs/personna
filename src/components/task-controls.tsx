"use client";
import { useActionState } from "react";
import { Check, Circle, Star, Trash } from "@/components/ui/icons";
import { deleteTaskAction, setTaskStatusAction, setTopTaskAction } from "@/server/actions/core";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ActionToast } from "@/components/action-toast";

function normalize(result: { ok: true } | { ok: false; error: string }) { return result.ok ? { ok: true } : { ok: false, error: result.error }; }

export function CompleteTaskButton({ taskId, done }: { taskId: string; done: boolean }) {
  const [state, action, pending] = useActionState(async () => normalize(await setTaskStatusAction(taskId, done ? "TODO" : "DONE")), null);
  return <form action={action} className="flex flex-col items-center"><ActionToast result={state} successMessage={done ? "Task reopened." : "Task completed."}/><button disabled={pending} aria-label={done ? "Reopen task" : "Complete task"} title={done ? "Reopen task" : "Complete task"} className={`grid size-8 place-items-center rounded-lg border transition ${done ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success),transparent_86%)] text-[var(--success)]" : "border-[var(--border-strong)] text-[var(--muted)] hover:border-[var(--success)] hover:text-[var(--success)]"}`}><Check size={15}/></button>{state && !state.ok && <span role="alert" className="mt-1 max-w-36 text-center text-[9px] text-[var(--danger)]">{state.error}</span>}</form>;
}

export function TopTaskButton({ taskId, selected }: { taskId: string; selected: boolean }) {
  const [state, action, pending] = useActionState(async () => normalize(await setTopTaskAction(taskId, !selected)), null);
  return <form action={action} className="flex flex-col items-center"><ActionToast result={state} successMessage={selected ? "Removed from today’s priorities." : "Added to today’s priorities."}/><button disabled={pending} aria-label={selected ? "Remove from today's priorities" : "Add to today's priorities"} title={selected ? "Remove from today" : "Add to today"} className={`grid size-8 place-items-center rounded-lg border transition ${selected ? "border-[var(--strawberry)] bg-[color-mix(in_srgb,var(--strawberry),transparent_88%)] text-[var(--strawberry)]" : "border-[var(--border-strong)] text-[var(--muted)] hover:border-[var(--strawberry)] hover:text-[var(--strawberry)]"}`}><Star size={15} fill={selected ? "currentColor" : "none"}/></button>{state && !state.ok && <span role="alert" className="mt-1 max-w-36 text-center text-[9px] text-[var(--danger)]">{state.error}</span>}</form>;
}

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [state, action, pending] = useActionState(async () => normalize(await deleteTaskAction(taskId)), null);
  return <form action={action} className="flex flex-col items-center">
    <ActionToast result={state} successMessage="Task deleted."/>
    <ConfirmSubmitButton disabled={pending} title="Delete this task?" description="It will be removed from your lists." confirmLabel="Delete task" className="grid size-8 cursor-pointer place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--danger),transparent_90%)] hover:text-[var(--danger)] disabled:opacity-50"><Trash size={14}/></ConfirmSubmitButton>
    {state && !state.ok && <span role="alert" className="max-w-36 text-center text-[9px] text-[var(--danger)]">{state.error}</span>}
    {state?.ok && <span role="status" className="text-[9px] text-[var(--success)]">Deleted</span>}
  </form>;
}

export function TaskStatusIcon({ done }: { done: boolean }) { return done ? <Check size={14}/> : <Circle size={14}/>; }
