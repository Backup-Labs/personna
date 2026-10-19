"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "@/components/ui/icons";

export function DismissiblePopover({ trigger, children, label, contentClassName, align = "right" }: {
  trigger: ReactNode;
  children: ReactNode;
  label: string;
  contentClassName: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return <div ref={root} className="relative inline-block max-w-full">
    <button ref={triggerRef} type="button" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(value => !value)}>{trigger}</button>
    {open && <section role="dialog" aria-label={label} className={`${contentClassName} ${align === "left" ? "left-0" : "right-0"}`}>
      <div className="mb-2 flex justify-end"><button type="button" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} aria-label={`Close ${label.toLowerCase()}`} title="Close" className="icon-button size-8"><X size={16}/></button></div>
      {children}
    </section>}
  </div>;
}
