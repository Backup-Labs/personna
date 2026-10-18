"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function RouteProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPending(false);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
  }, [pathname]);

  useEffect(() => {
    const handleNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      setPending(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setPending(false), 30_000);
    };

    document.addEventListener("click", handleNavigation, true);
    return () => {
      document.removeEventListener("click", handleNavigation, true);
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  if (!pending) return null;
  return <div className="route-progress" role="status" aria-live="polite"><span className="route-progress-bar"/><span className="sr-only">Loading page…</span></div>;
}
