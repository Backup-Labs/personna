import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Assistant | Personna", description: "Private assistant status and controls." };
export default function AssistantLayout({ children }: { children: ReactNode }) { return children; }
