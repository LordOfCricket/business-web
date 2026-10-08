import { Skeleton } from "@/components/ui";

export default function WorkspaceLoading() {
  return (
    <div role="status" aria-label="Loading workspace" className="flex flex-col gap-6 py-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-10 w-96 rounded-2xl" />
        <Skeleton className="h-5 w-72 rounded-xl" />
      </div>

      <div className="flex gap-2 border-b border-line pb-4">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );
}
