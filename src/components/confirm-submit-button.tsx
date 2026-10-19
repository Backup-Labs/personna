"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState, type ReactNode } from "react";

export function ConfirmSubmitButton({ children, title, description, confirmLabel = "Confirm", disabled = false, className }: {
  children: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  disabled?: boolean;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const form = useRef<HTMLFormElement | null>(null);
  return <>
    <button type="button" disabled={disabled} className={className} onClick={event => { form.current = event.currentTarget.form; setOpen(true); }}>{children}</button>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm"/>
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-5 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-display text-lg font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close className="min-h-10 cursor-pointer rounded-lg border border-[var(--border)] px-4 text-sm text-[var(--tan)] hover:bg-[var(--surface-2)]">Cancel</Dialog.Close>
            <button type="button" disabled={disabled} className="min-h-10 cursor-pointer rounded-lg bg-[var(--danger)] px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60" onClick={() => { const target = form.current; setOpen(false); requestAnimationFrame(() => target?.requestSubmit()); }}>{confirmLabel}</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
