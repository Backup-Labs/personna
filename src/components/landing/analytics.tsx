"use client";

import Script from "next/script";

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

export function trackLandingEvent(event: string, props?: Record<string, string>) {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true") window.plausible?.(event, props ? { props } : undefined);
}

export function LandingAnalytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true" || !domain) return null;
  return <Script defer data-domain={domain} src="https://plausible.io/js/script.js" strategy="afterInteractive"/>;
}
