"use client";

import { useActionState } from "react";
import { Children, isValidElement, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { CalendarClock, ChevronDown, ChevronLeft, ChevronRight } from "@/components/ui/icons";

type Result = { ok: boolean; error?: string } | null;
type FormAction = (formData: FormData) => Promise<{ ok: boolean; error?: string }>;

export function ActionForm({ action, children, submitLabel = "Save" }: { action: FormAction; children: ReactNode; submitLabel?: string }) {
  const [state, formAction, pending] = useActionState(async (_previous: Result, formData: FormData) => action(formData), null);
  return <form action={formAction} className="space-y-3">{children}{state?.error && <p role="alert" aria-live="assertive" className="text-sm text-[var(--danger)]">{state.error}</p>}{state?.ok && <p role="status" aria-live="polite" className="text-sm text-[var(--success)]">Saved.</p>}<button disabled={pending} className="min-h-11 rounded-xl bg-[var(--strawberry)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:shadow-[0_0_24px_color-mix(in_srgb,var(--strawberry),transparent_65%)] disabled:cursor-wait disabled:opacity-60">{pending ? "Saving…" : submitLabel}</button></form>;
}

export function Field({ label, name, type = "text", required = false, defaultValue, children }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string; children?: ReactNode }) {
  const select = isValidElement(children) && children.type === "select" ? children as ReactElement<{ name?: string; defaultValue?: string; required?: boolean; children?: ReactNode }> : null;
  return <label className="block text-xs font-medium text-[var(--muted)]">{label}{select ? <CustomSelect name={select.props.name ?? name} defaultValue={select.props.defaultValue ?? defaultValue} required={select.props.required ?? required}>{select.props.children}</CustomSelect> : children ?? (type === "date" || type === "month" || type === "datetime-local" || type === "time" ? <CustomDateTime name={name} type={type} required={required} defaultValue={defaultValue}/> : <input name={name} type={type} required={required} defaultValue={defaultValue} className="form-control" />)}</label>;
}

export function CustomSelect({ name, defaultValue, required, children, onValueChange }: { name: string; defaultValue?: string; required?: boolean; children?: ReactNode; onValueChange?: (value: string) => void }) {
  const options = Children.toArray(children).filter(isValidElement).map(option => { const props = option.props as { value?: string; children?: ReactNode; disabled?: boolean }; return { value: String(props.value ?? ""), label: String(props.children ?? ""), disabled: props.disabled ?? false }; });
  const [value, setValue] = useState(defaultValue ?? options.find(option => !option.disabled)?.value ?? "");
  const [open, setOpen] = useState(false);
  const current = options.find(option => option.value === value);
  return <div className="custom-picker relative mt-1.5" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <input type="hidden" name={name} value={value}/>
    <button type="button" data-required={required || undefined} className="form-control mt-0 flex items-center justify-between gap-3 text-left" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(state => !state)}><span className={current ? "" : "text-[var(--muted)]"}>{current?.label ?? "Choose an option"}</span><ChevronDown size={13} className="text-[var(--muted)]"/></button>
    {open && <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[var(--border-strong)] bg-[var(--surface-1)] p-1 shadow-2xl" role="listbox" aria-label={name}>{options.map(option => <button type="button" key={option.value} role="option" aria-selected={value === option.value} disabled={option.disabled} onClick={() => { setValue(option.value); onValueChange?.(option.value); setOpen(false); }} className={`flex min-h-10 w-full items-center rounded-md px-3 text-left text-sm hover:bg-[var(--surface-2)] disabled:opacity-50 ${value === option.value ? "text-[var(--strawberry)]" : "text-[var(--tan)]"}`}>{option.label}</button>)}</div>}
  </div>;
}

function CustomDateTime({ name, type, required, defaultValue }: { name: string; type: string; required?: boolean; defaultValue?: string }) {
  const initial = defaultValue ?? "";
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const initialDate = type === "time" ? "" : type === "month" ? (value ? `${value}-01` : "") : value.slice(0, 10);
  const [visibleMonth, setVisibleMonth] = useState(() => { const date = initialDate ? new Date(`${initialDate}T12:00:00`) : new Date(); return new Date(date.getFullYear(), date.getMonth(), 1); });
  const cells = useMemo(() => { const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1); const count = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate(); return [...Array(first.getDay()).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]; }, [visibleMonth]);
  const date = initialDate ? new Date(`${initialDate}T12:00:00`) : null;
  const label = type === "time" ? value || "Choose time" : date ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date) + (type === "datetime-local" && value.slice(11) ? ` · ${value.slice(11)}` : "") : type === "month" && value ? value : "Choose date";
  const monthName = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(visibleMonth);
  const selectDay = (day: number) => { const key = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; setValue(type === "month" ? key.slice(0, 7) : type === "datetime-local" ? `${key}T${value.slice(11) || "09:00"}` : key); if (type !== "datetime-local") setOpen(false); };
  return <div className="custom-picker relative mt-1.5" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <input type="hidden" name={name} value={value}/>
    <button type="button" data-required={required || undefined} className="form-control mt-0 flex items-center justify-between gap-3 text-left" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(state => !state)}><span className={value ? "" : "text-[var(--muted)]"}>{label}</span><CalendarClock size={14} className="text-[var(--strawberry)]"/></button>
    {open && <div role="dialog" aria-label="Choose date and time" className="absolute left-0 top-full z-40 mt-1 w-[min(90vw,310px)] rounded-lg border border-[var(--border-strong)] bg-[var(--surface-1)] p-4 shadow-2xl">
      {type === "time" ? <><p className="mb-3 text-sm font-semibold">Choose a time slot</p><div className="grid max-h-52 grid-cols-4 gap-1 overflow-y-auto">{Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`).map(time => <button key={time} type="button" onClick={() => { setValue(time); setOpen(false); }} className={`rounded-md py-2 text-xs hover:bg-[var(--surface-2)] ${value === time ? "text-[var(--strawberry)]" : ""}`}>{time}</button>)}</div></> : type === "month" ? <><div className="flex items-center justify-between"><button type="button" className="icon-button size-8" aria-label="Previous month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}><ChevronLeft size={14}/></button><span className="text-sm font-semibold">{monthName}</span><button type="button" className="icon-button size-8" aria-label="Next month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}><ChevronRight size={14}/></button></div><button type="button" className="mt-3 min-h-10 w-full rounded-md bg-[var(--surface-2)] text-sm hover:text-[var(--strawberry)]" onClick={() => { setValue(`${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`); setOpen(false); }}>Use {monthName}</button></> : <>
        <div className="mb-3 flex items-center justify-between"><button type="button" className="icon-button size-8" aria-label="Previous month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}><ChevronLeft size={14}/></button><span className="text-sm font-semibold">{monthName}</span><button type="button" className="icon-button size-8" aria-label="Next month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}><ChevronRight size={14}/></button></div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--muted)]">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}${index}`} className="py-1">{day}</span>)}{cells.map((day, index) => day ? <button type="button" key={day} onClick={() => selectDay(day)} className={`grid aspect-square place-items-center rounded-md text-xs hover:bg-[var(--surface-2)] ${date && date.getDate() === day && date.getMonth() === visibleMonth.getMonth() ? "bg-[var(--strawberry)] font-semibold text-[var(--ink)]" : ""}`}>{day}</button> : <span key={`empty-${index}`}/>)}</div>
        {type === "datetime-local" && <div className="mt-3 border-t border-[var(--border)] pt-3"><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Choose a time slot</p><div className="grid max-h-28 grid-cols-4 gap-1 overflow-y-auto">{Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`).map(time => <button key={time} type="button" onClick={() => { const dateValue = value.slice(0, 10) || `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`; setValue(`${dateValue}T${time}`); setOpen(false); }} className={`rounded-md py-1.5 text-[10px] hover:bg-[var(--surface-2)] ${value.slice(11) === time ? "text-[var(--strawberry)]" : ""}`}>{time}</button>)}</div></div>}
      </>}
    </div>}
  </div>;
}
