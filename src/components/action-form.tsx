"use client";

import { useActionState } from "react";
import { Children, isValidElement, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { CalendarClock, ChevronDown, ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { ActionToast } from "@/components/action-toast";

type Result = { ok: boolean; error?: string } | null;
type FormAction = (formData: FormData) => Promise<{ ok: boolean; error?: string }>;

export function ActionForm({ action, children, submitLabel = "Save" }: { action: FormAction; children: ReactNode; submitLabel?: string }) {
  const [state, formAction, pending] = useActionState(async (_previous: Result, formData: FormData) => action(formData), null);
  return <form action={formAction} className="space-y-3"><ActionToast result={state} successMessage="Saved."/>{children}{state?.error && <p role="alert" aria-live="assertive" className="text-sm text-[var(--danger)]">{state.error}</p>}{state?.ok && <p role="status" aria-live="polite" className="text-sm text-[var(--success)]">Saved.</p>}<button disabled={pending} className="min-h-11 rounded-xl bg-[var(--strawberry)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:shadow-[0_0_24px_color-mix(in_srgb,var(--strawberry),transparent_65%)] disabled:cursor-wait disabled:opacity-60">{pending ? "Saving…" : submitLabel}</button></form>;
}

export function Field({ label, name, type = "text", required = false, defaultValue, autoComplete, minLength, disablePast = false, children }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string; autoComplete?: string; minLength?: number; disablePast?: boolean; children?: ReactNode }) {
  const select = isValidElement(children) && children.type === "select" ? children as ReactElement<{ name?: string; defaultValue?: string; required?: boolean; children?: ReactNode }> : null;
  return <label className="block text-xs font-medium text-[var(--muted)]">{label}{select ? <CustomSelect name={select.props.name ?? name} defaultValue={select.props.defaultValue ?? defaultValue} required={select.props.required ?? required}>{select.props.children}</CustomSelect> : children ?? (type === "date" || type === "month" || type === "datetime-local" || type === "time" ? <CustomDateTime name={name} type={type} required={required} defaultValue={defaultValue} disablePast={disablePast}/> : <input name={name} type={type} required={required} defaultValue={defaultValue} autoComplete={autoComplete} minLength={minLength} className="form-control" />)}</label>;
}

export function CustomSelect({ name, defaultValue, required, children, onValueChange, ariaLabel }: { name: string; defaultValue?: string; required?: boolean; children?: ReactNode; onValueChange?: (value: string) => void; ariaLabel?: string }) {
  const options = Children.toArray(children).filter(isValidElement).map(option => { const props = option.props as { value?: string; children?: ReactNode; disabled?: boolean }; return { value: String(props.value ?? ""), label: String(props.children ?? ""), disabled: props.disabled ?? false }; });
  const [value, setValue] = useState(defaultValue ?? options.find(option => !option.disabled)?.value ?? "");
  const [open, setOpen] = useState(false);
  const current = options.find(option => option.value === value);
  return <div className="custom-picker relative mt-1.5" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <input type="hidden" name={name} value={value}/>
    <button type="button" data-required={required || undefined} className="form-control mt-0 flex items-center justify-between gap-3 text-left" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(state => !state)}><span className={current ? "" : "text-[var(--muted)]"}>{current?.label ?? "Choose an option"}</span><ChevronDown size={13} className="text-[var(--muted)]"/></button>
    {open && <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[var(--border-strong)] bg-[var(--surface-1)] p-1 shadow-2xl" role="listbox" aria-label={name}>{options.map(option => <button type="button" key={option.value} role="option" aria-selected={value === option.value} disabled={option.disabled} onClick={() => { setValue(option.value); onValueChange?.(option.value); setOpen(false); }} className={`flex min-h-10 w-full items-center rounded-md px-3 text-left text-sm hover:bg-[var(--surface-2)] disabled:opacity-50 ${value === option.value ? "text-[var(--strawberry)]" : "text-[var(--tan)]"}`}>{option.label}</button>)}</div>}
  </div>;
}

function CustomDateTime({ name, type, required, defaultValue, disablePast }: { name: string; type: string; required?: boolean; defaultValue?: string; disablePast: boolean }) {
  const initial = defaultValue ?? "";
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [dateDraft, setDateDraft] = useState(type === "month" ? initial : initial.slice(0, 10));
  const [timeDraft, setTimeDraft] = useState(type === "time" ? initial : initial.slice(11, 16));
  const initialDate = type === "time" ? "" : type === "month" ? (value ? `${value}-01` : "") : value.slice(0, 10);
  const [visibleMonth, setVisibleMonth] = useState(() => { const date = initialDate ? new Date(`${initialDate}T12:00:00`) : new Date(); return new Date(date.getFullYear(), date.getMonth(), 1); });
  const cells = useMemo(() => { const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1); const count = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate(); return [...Array(first.getDay()).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]; }, [visibleMonth]);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const monthName = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(visibleMonth);
  const isPastDate = (dateKey: string) => disablePast && dateKey < todayKey;
  const isValidDate = (input: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
    const [year, month, day] = input.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
  };
  const selectedDateValue = type === "month" ? (dateDraft ? `${dateDraft}-01` : "") : dateDraft;
  const date = selectedDateValue && isValidDate(selectedDateValue) ? new Date(`${selectedDateValue}T12:00:00`) : null;
  const isValidTime = (input: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(input);
  const syncDate = (input: string) => {
    setDateDraft(input);
    if (type === "month") {
      const valid = /^\d{4}-(0[1-9]|1[0-2])$/.test(input);
      setValue(valid ? input : "");
      if (valid) setVisibleMonth(new Date(`${input}-01T12:00:00`));
      return;
    }
    const valid = isValidDate(input);
    if (valid) setVisibleMonth(new Date(`${input}T12:00:00`));
    setValue(valid ? (type === "datetime-local" && isValidTime(timeDraft) ? `${input}T${timeDraft}` : type === "datetime-local" ? "" : input) : "");
  };
  const syncTime = (input: string) => {
    setTimeDraft(input);
    if (type === "time") setValue(isValidTime(input) ? input : "");
    else setValue(isValidDate(dateDraft) && isValidTime(input) ? `${dateDraft}T${input}` : "");
  };
  const selectDay = (day: number) => {
    const key = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (type === "month") { const month = key.slice(0, 7); setDateDraft(month); setValue(month); setOpen(false); return; }
    setDateDraft(key);
    if (type === "datetime-local" && !isValidTime(timeDraft)) setTimeDraft("09:00");
    setValue(type === "datetime-local" ? `${key}T${isValidTime(timeDraft) ? timeDraft : "09:00"}` : key);
    if (type !== "datetime-local") setOpen(false);
  };
  return <div className="custom-picker relative mt-1.5" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <input type="hidden" name={name} value={value}/>
    <div className="flex min-w-0 items-center gap-2">
      {type === "time" ? <input type="text" inputMode="numeric" autoComplete="off" aria-label={`${name} time (HH:MM)`} placeholder="HH:MM" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" required={required} value={timeDraft} onChange={event => syncTime(event.target.value)} data-time-only="true" className="form-control custom-picker-time-input mt-0"/> : <>
        <input type="text" inputMode="numeric" autoComplete="off" aria-label={`${name} ${type === "month" ? "month" : "date"}`} placeholder={type === "month" ? "YYYY-MM" : "YYYY-MM-DD"} pattern={type === "month" ? "[0-9]{4}-(0[1-9]|1[0-2])" : "[0-9]{4}-[0-9]{2}-[0-9]{2}"} required={required} value={dateDraft} onChange={event => { const input = event.target.value; event.currentTarget.setCustomValidity(isPastDate(input) ? "Past days are unavailable." : ""); syncDate(input); }} className="form-control custom-picker-date-input mt-0"/>
        {type === "datetime-local" && <input type="text" inputMode="numeric" autoComplete="off" aria-label={`${name} time (HH:MM)`} placeholder="HH:MM" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" required={required} value={timeDraft} onChange={event => syncTime(event.target.value)} className="form-control custom-picker-time-input mt-0"/>}
      </>}
      <button type="button" className="icon-button grid size-11 shrink-0 cursor-pointer place-items-center" aria-label={type === "time" ? "Choose time" : "Open calendar"} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(state => !state)}><CalendarClock size={15} className="text-[var(--strawberry)]"/></button>
    </div>
    {open && <div role="dialog" aria-label="Choose date and time" className="absolute left-0 top-full z-40 mt-1 w-[min(90vw,310px)] rounded-lg border border-[var(--border-strong)] bg-[var(--surface-1)] p-4 shadow-2xl">
      {type === "time" ? <><p className="mb-3 text-sm font-semibold">Choose a time</p><div className="grid max-h-52 grid-cols-4 gap-1 overflow-y-auto">{Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`).map(time => <button key={time} type="button" aria-pressed={value === time} onClick={() => { setTimeDraft(time); setValue(time); setOpen(false); }} className={`rounded-md py-2 text-xs hover:bg-[var(--surface-2)] ${value === time ? "bg-[color-mix(in_srgb,var(--strawberry),transparent_82%)] font-semibold text-[var(--strawberry)]" : ""}`}>{time}</button>)}</div></> : type === "month" ? <><div className="flex items-center justify-between"><button type="button" className="icon-button size-8" aria-label="Previous month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}><ChevronLeft size={14}/></button><span className="text-sm font-semibold">{monthName}</span><button type="button" className="icon-button size-8" aria-label="Next month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}><ChevronRight size={14}/></button></div><button type="button" className="mt-3 min-h-10 w-full rounded-md bg-[var(--surface-2)] text-sm hover:text-[var(--strawberry)]" onClick={() => { const month = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`; setDateDraft(month); setValue(month); setOpen(false); }}>Use {monthName}</button></> : <>
        <div className="mb-3 flex items-center justify-between"><button type="button" className="icon-button size-8" aria-label="Previous month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}><ChevronLeft size={14}/></button><span className="text-sm font-semibold">{monthName}</span><button type="button" className="icon-button size-8" aria-label="Next month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}><ChevronRight size={14}/></button></div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--muted)]">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}${index}`} className="py-1">{day}</span>)}{cells.map((day, index) => { if (!day) return <span key={`empty-${index}`}/>; const key = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; const isSelected = Boolean(date && date.getDate() === day && date.getMonth() === visibleMonth.getMonth() && date.getFullYear() === visibleMonth.getFullYear()); const isToday = today.getDate() === day && today.getMonth() === visibleMonth.getMonth() && today.getFullYear() === visibleMonth.getFullYear(); const past = isPastDate(key); return <button type="button" key={day} disabled={past} aria-pressed={isSelected} aria-current={isToday ? "date" : undefined} onClick={() => selectDay(day)} className={`grid aspect-square place-items-center rounded-md border text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${isSelected ? "border-[var(--strawberry)] bg-[var(--strawberry)] font-semibold text-[var(--ink)]" : isToday ? "border-[var(--strawberry)]/70 bg-[color-mix(in_srgb,var(--strawberry),transparent_88%)] font-semibold text-[var(--strawberry)]" : "border-transparent hover:bg-[var(--surface-2)]"}`}>{day}</button>; })}</div>
        {type === "datetime-local" && <div className="mt-3 border-t border-[var(--border)] pt-3"><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Choose a time slot</p><div className="grid max-h-28 grid-cols-4 gap-1 overflow-y-auto">{Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`).map(time => <button key={time} type="button" onClick={() => { const dateValue = value.slice(0, 10) || `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`; setValue(`${dateValue}T${time}`); setOpen(false); }} className={`rounded-md py-1.5 text-[10px] hover:bg-[var(--surface-2)] ${value.slice(11) === time ? "text-[var(--strawberry)]" : ""}`}>{time}</button>)}</div></div>}
      </>}
    </div>}
  </div>;
}
