import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { RouteProgress } from "@/components/route-progress";

export const metadata: Metadata = {
  title: "Personna | Personal Operating System",
  description: "One system. Every responsibility. Meaningful progress.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en" className="dark"><head><link rel="preconnect" href="https://api.fontshare.com"/><link rel="preconnect" href="https://fonts.fontshare.com" crossOrigin="anonymous"/><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/></head><body><RouteProgress/>{children}</body></html>;
}
