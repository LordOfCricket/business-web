import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, Pagination, Table } from "@/components/ui";
import { orgDisputes, STATUS_LABEL } from "@/features/disputes/api";
import { requireBusiness } from "@/features/org/context";

export const metadata: Metadata = { title: "Disputes" };

const dates = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });
const money = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

/** Complaints raised against this business (spec §22). The business answers; LordOfSportz decides. */
export default async function BusinessDisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session, org } = await requireBusiness();
  const page = Math.max(0, Number.parseInt((await searchParams).page ?? "0", 10) || 0);
  const { items, meta } = await orgDisputes(org.id, session.accessToken, page);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Disputes</h1>
      <p className="text-sm text-muted">
        A customer has raised a problem about a booking, an order or a payment. Reply here; if it is not
        settled between you, LordOfSportz decides and may refund from the original payment.
      </p>

      {items.length === 0 ? (
        <EmptyState title="No disputes" description="Nothing has been raised against this business." />
      ) : (
        <Table
          caption="Disputes against this business"
          rows={items}
          rowKey={(d) => d.id}
          columns={[
            {
              key: "subject",
              header: "Problem",
              render: (d) => (
                <Link href={`/disputes/${d.id}`} className="font-medium text-brand-700 hover:underline">
                  {d.subject}
                </Link>
              ),
            },
            { key: "about", header: "About", render: (d) => d.referenceLabel },
            { key: "customer", header: "Customer", render: (d) => d.raisedByName },
            {
              key: "status",
              header: "Status",
              render: (d) => (
                <Badge
                  tone={d.status === "OPEN" ? "warning" : d.status === "RESOLVED" ? "success" : "neutral"}
                >
                  {STATUS_LABEL[d.status]}
                </Badge>
              ),
            },
            {
              key: "refund",
              header: "Refunded",
              render: (d) => (d.refundAmount ? money(d.refundAmount, d.currency) : "—"),
            },
            { key: "raised", header: "Raised", render: (d) => dates.format(new Date(d.createdAt)) },
          ]}
        />
      )}
      {meta && (
        <Pagination page={meta.page} totalPages={meta.totalPages} hrefFor={(p) => `/disputes?page=${p}`} />
      )}
    </div>
  );
}
