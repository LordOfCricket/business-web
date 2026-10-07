import { Badge, Card, EmptyState, Pagination } from "@/components/ui";
import type { PageMeta } from "@/types/api";
import type { ManagedReview } from "./api";
import { ReplyForm } from "./ReplyForm";

const KIND = { VENUE: "Venue", PROFESSIONAL: "Profile", ORGANIZATION: "Business" } as const;

/** Reviews with rating, text and a reply box; hidden reviews are shown with the moderator's reason. */
export function ReviewList({
  items,
  meta,
  hrefFor,
  emptyTitle,
}: {
  items: ManagedReview[];
  meta?: PageMeta;
  hrefFor: (page: number) => string;
  emptyTitle: string;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description="Reviews from customers appear here as they arrive." />;
  }
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {items.map((r) => (
          <li key={r.id}>
            <Card className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-amber-500" aria-label={`${r.rating} out of 5`}>
                  {"★".repeat(r.rating)}
                  <span className="text-line">{"★".repeat(5 - r.rating)}</span>
                </span>
                <Badge>
                  {KIND[r.targetType]}
                  {r.targetName ? ` · ${r.targetName}` : ""}
                </Badge>
                {r.verified && <Badge tone="success">Verified</Badge>}
                {r.status === "HIDDEN" && <Badge tone="danger">Hidden by moderators</Badge>}
                {r.reportCount > 0 && <Badge tone="warning">Reported {r.reportCount}×</Badge>}
              </div>
              {r.title && <p className="font-semibold">{r.title}</p>}
              {r.body && <p className="text-sm whitespace-pre-line">{r.body}</p>}
              <p className="text-xs text-muted">
                {r.authorName} · {new Date(r.createdAt).toLocaleDateString("en-IN")}
              </p>
              {r.status === "HIDDEN" && r.hiddenReason && (
                <p className="text-sm text-muted">Reason: {r.hiddenReason}</p>
              )}
              {r.reply && (
                <blockquote className="border-l-2 border-line pl-3 text-sm">
                  <p className="font-medium">Your reply</p>
                  <p className="whitespace-pre-line">{r.reply}</p>
                </blockquote>
              )}
              {r.status === "PUBLISHED" && <ReplyForm reviewId={r.id} current={r.reply} />}
            </Card>
          </li>
        ))}
      </ul>
      {meta && <Pagination page={meta.page} totalPages={meta.totalPages} hrefFor={hrefFor} />}
    </div>
  );
}
