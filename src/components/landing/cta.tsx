"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { landingContent } from "@/content/landing";
import { trackLandingEvent } from "./analytics";

export function LandingButton({ href, variant = "primary", className = "", children, onClick }: { href: string; variant?: "primary" | "secondary"; className?: string; children: ReactNode; onClick?: () => void }) {
  return <Link href={href} className={`landing-button landing-button-${variant} ${className}`} onClick={onClick}>{children}</Link>;
}

export function StartFreeLink({ className = "", children }: { className?: string; children?: ReactNode }) {
  return <LandingButton href="/signup" className={className} onClick={() => trackLandingEvent("start_free_click")}>{children ?? landingContent.ui.startFree}</LandingButton>;
}
