import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { RouteProgress } from "@/components/route-progress";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Personna | Personal Operating System",
  description: "One system. Every responsibility. Meaningful progress.",
  metadataBase: getSiteUrl(),
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en" className="dark"><head><link rel="preconnect" href="https://api.fontshare.com"/><link rel="preconnect" href="https://fonts.fontshare.com" crossOrigin="anonymous"/><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/></head><body><RouteProgress/>{children}</body></html>;
}
