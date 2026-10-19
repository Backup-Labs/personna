import { PageSkeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/app-shell";

export default function Loading() {
  return <AppShell><div aria-busy="true" className="mx-auto max-w-[1440px]"><PageSkeleton/></div></AppShell>;
}
