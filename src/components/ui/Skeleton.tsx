import { cn } from "@/lib/utils/cn";

/** Loading placeholder (spec §47 loading states). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-line", className)} />;
}
