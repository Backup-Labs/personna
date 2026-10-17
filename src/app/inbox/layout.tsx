import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inbox | Personna", description: "Process captured tasks and notes." };
export default function InboxLayout({ children }: { children: ReactNode }) { return children; }
