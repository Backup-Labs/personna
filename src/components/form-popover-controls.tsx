"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@/components/ui/icons";

export function FormPopoverControls() {
  const [panels, setPanels] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const refresh = () => {
      const next = Array.from(document.querySelectorAll<HTMLDetailsElement>("details[open]:has(form):not(:has(> summary[aria-label='Account menu']))"))
        .map(details => details.querySelector<HTMLElement>(":scope > div"))
        .filter((panel): panel is HTMLElement => Boolean(panel));
      for (const panel of next) panel.classList.add("form-popover-panel");
      setPanels(current => current.length === next.length && current.every((panel, index) => panel === next[index]) ? current : next);
    };
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
    document.addEventListener("toggle", refresh, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    refresh();
    return () => {
      observer.disconnect();
      document.removeEventListener("toggle", refresh, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };

    function closeOpenPopovers(focus: boolean) {
      const open = Array.from(document.querySelectorAll<HTMLDetailsElement>("details[open]:has(form):not(:has(> summary[aria-label='Account menu'])), details[open]:has(> summary[aria-label='Account menu'])"));
      for (const details of open) details.open = false;
      if (focus) open.at(-1)?.querySelector<HTMLElement>(":scope > summary")?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      for (const details of document.querySelectorAll<HTMLDetailsElement>("details[open]:has(form), details[open]:has(> summary[aria-label='Account menu'])")) {
        if (!details.contains(target)) details.open = false;
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && document.querySelector("details[open]:has(form), details[open]:has(> summary[aria-label='Account menu'])")) {
        event.preventDefault();
        closeOpenPopovers(true);
      }
    }
  }, []);

  return <>{panels.map((panel, index) => createPortal(
    <button key="close" type="button" className="form-popover-close icon-button size-8" aria-label="Close form" title="Close" onClick={() => {
      const details = panel.parentElement;
      if (details instanceof HTMLDetailsElement) {
        details.open = false;
        details.querySelector<HTMLElement>(":scope > summary")?.focus();
      }
    }}><X size={16}/></button>,
    panel,
    `form-popover-${index}`,
  ))}</>;
}
