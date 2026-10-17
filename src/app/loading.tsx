import { PageSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="min-h-screen bg-[var(--ink)] p-4 pt-20 text-[var(--tan)] sm:p-8"><div className="mx-auto max-w-[1440px]"><PageSkeleton/></div></main>;
}
