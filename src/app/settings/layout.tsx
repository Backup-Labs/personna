import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings | Personna", description: "Manage your profile, privacy, and workspace preferences." };
export default function SettingsLayout({ children }: { children: ReactNode }) { return children; }
