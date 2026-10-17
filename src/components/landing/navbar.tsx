"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, Sparkles, X } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { StartFreeLink } from "./cta";

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    document.getElementById("mobile-navigation")?.querySelector<HTMLElement>("a")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.getElementById("mobile-navigation-trigger")?.focus();
    };
  }, [open]);
  return <header className="landing-navbar">
    <nav aria-label={landingContent.ui.mainNavigation} className="landing-container flex h-[68px] items-center justify-between gap-5">
      <Link href="/" aria-label={landingContent.ui.brandAria} className="landing-brand"><span><Sparkles size={17}/></span>{landingContent.ui.brand}</Link>
      <div className="hidden items-center gap-7 md:flex">{landingContent.nav.map(item => <a key={item.href} href={item.href} className="landing-nav-link">{item.label}</a>)}</div>
      <div className="hidden items-center gap-5 md:flex"><Link className="landing-nav-link" href="/login">{landingContent.ui.signIn}</Link><StartFreeLink className="landing-button-small"/></div>
      <button id="mobile-navigation-trigger" type="button" className="landing-menu-button md:hidden" aria-label={open ? landingContent.ui.closeMenu : landingContent.ui.openMenu} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(value => !value)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
    </nav>
    {open && <div id="mobile-navigation" role="dialog" aria-modal="true" aria-label={landingContent.ui.mobileNavigation} className="landing-mobile-sheet md:hidden" onKeyDown={event => {
      if (event.key !== "Tab") return;
      const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
      <nav aria-label={landingContent.ui.mobileNavigation} className="landing-mobile-nav">{landingContent.nav.map((item, index) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{item.label}<ArrowRight size={16}/></a>)}
        <Link href="/login" onClick={() => setOpen(false)}>{landingContent.ui.signIn}</Link><StartFreeLink/>
      </nav>
    </div>}
  </header>;
}
