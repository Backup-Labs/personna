import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects | Personna", description: "Plan and move your active projects forward." };
export default function ProjectsLayout({ children }: { children: ReactNode }) { return children; }
