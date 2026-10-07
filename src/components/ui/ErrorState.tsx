import type { ReactNode } from "react";

/** User-facing error. Shows the request id so support can trace it — never internal details (spec §50). */
export function ErrorState({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  requestId,
  action,
}: {
  title?: string;
  message?: string;
  requestId?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-3xl bg-surface p-10 text-center ring-1 ring-red-200"
    >
      <p className="display text-2xl text-ink">{title}</p>
      <p className="max-w-md text-sm text-muted">{message}</p>
      {requestId && <p className="text-xs text-muted">Reference: {requestId}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
