import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { getDispute, STATUS_LABEL } from "@/features/disputes/api";
import { DisputeReplyForm } from "@/features/disputes/ReplyForm";
import { requireBusiness } from "@/features/org/context";

export const metadata: Metadata = { title: "Dispute", robots: { index: false } };

const dates = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });
const money = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

const WHO: Record<string, string> = { CUSTOMER: "Customer", OWNER: "You", ADMIN: "LordOfSportz" };

export default async function BusinessDisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session } = await requireBusiness();
  const detail = await getDispute(session.accessToken, id);
  if (!detail) notFound();
  const d = detail.dispute;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/disputes" className="text-sm font-medium text-brand-700 hover:underline">
          ← All disputes
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="display text-3xl leading-tight sm:text-4xl">{d.subject}</h1>
          <Badge tone={d.status === "OPEN" ? "warning" : d.status === "RESOLVED" ? "success" : "neutral"}>
            {STATUS_LABEL[d.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          {d.number} · about {d.referenceLabel} · raised by {d.raisedByName} on{" "}
          {dates.format(new Date(d.createdAt))}
          {d.amount != null && <> · {money(d.amount, d.currency)} paid</>}
        </p>
      </div>

      {detail.resolution && (
        <Card className="flex flex-col gap-1">
          <h2 className="font-semibold">Decision</h2>
          <p className="text-sm whitespace-pre-line">{detail.resolution}</p>
          {d.refundAmount != null && (
            <p className="text-sm">{money(d.refundAmount, d.currency)} was refunded to the customer.</p>
          )}
        </Card>
      )}

      <section aria-labelledby="thread-title" className="flex flex-col gap-3">
        <h2 id="thread-title" className="text-lg font-semibold">
          Messages
        </h2>
        <ul className="flex flex-col gap-3">
          {detail.messages.map((m) => (
            <li key={m.id}>
              <Card className="flex flex-col gap-1">
                <p className="text-xs text-muted">
                  {WHO[m.authorRole] ?? m.authorName} · {dates.format(new Date(m.createdAt))}
                </p>
                <p className="text-sm whitespace-pre-line">{m.body}</p>
              </Card>
            </li>
          ))}
        </ul>
        {detail.canMessage ? (
          <DisputeReplyForm id={d.id} />
        ) : (
          <p className="text-sm text-muted">This dispute is closed, so no more messages can be added.</p>
        )}
      </section>
    </div>
  );
}
