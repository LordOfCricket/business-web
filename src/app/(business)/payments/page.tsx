import type { Metadata } from "next";
import { Badge, Card, EmptyState, Pagination, Table } from "@/components/ui";
import { humanize, STATUS_TONE } from "@/features/org/constants";
import { requireBusiness } from "@/features/org/context";
import { listOrgPayments, money, orgTotals, type PaymentFilters } from "@/features/payments/api";

export const metadata: Metadata = { title: "Payments" };

const STATUSES = ["SUCCEEDED", "PARTIALLY_REFUNDED", "REFUNDED", "PENDING", "FAILED", "CANCELLED"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Transactions for this business's bookings and orders with totals for the period (spec §21 Payments). Payouts to the
 * business are not part of the specification yet; this is a transactions view.
 */
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string; page?: string }>;
}) {
  const { session, org } = await requireBusiness();
  const sp = await searchParams;
  const filters: PaymentFilters = {
    status: STATUSES.includes(sp.status ?? "") ? sp.status : undefined,
    from: DATE.test(sp.from ?? "") ? sp.from : undefined,
    to: DATE.test(sp.to ?? "") ? sp.to : undefined,
    page: Math.max(0, Number.parseInt(sp.page ?? "0", 10) || 0),
  };
  const [{ items, meta }, totals] = await Promise.all([
    listOrgPayments(org.id, session.accessToken, filters),
    orgTotals(org.id, session.accessToken, filters),
  ]);
  const field = "h-10 rounded-lg border border-line bg-surface px-3 font-normal";
  const hrefFor = (p: number) =>
    `/payments?${new URLSearchParams({
      status: filters.status ?? "",
      from: filters.from ?? "",
      to: filters.to ?? "",
      page: String(p),
    })}`;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
      <form className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          From
          <input type="date" name="from" defaultValue={filters.from} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          To
          <input type="date" name="to" defaultValue={filters.to} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Status
          <select name="status" defaultValue={filters.status ?? ""} className={field}>
            <option value="">Any</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white">
          Show
        </button>
      </form>
      <p className="text-sm text-muted">
        {filters.from || filters.to ? "Selected period" : "Last 30 days"} · totals include completed payments
        only
      </p>
      <section aria-label="Totals" className="grid gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-sm text-muted">Payments</p>
          <p className="text-2xl font-bold">{totals.payments}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Collected</p>
          <p className="text-2xl font-bold">{money(totals.gross)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Refunded</p>
          <p className="text-2xl font-bold">{money(totals.refunded)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Net</p>
          <p className="text-2xl font-bold text-brand-700">{money(totals.net)}</p>
        </Card>
      </section>
      {items.length === 0 ? (
        <EmptyState
          title="No payments in this period"
          description="Payments for bookings and orders appear here."
        />
      ) : (
        <Table
          caption="Payments"
          rows={items}
          rowKey={(p) => p.id}
          columns={[
            {
              key: "date",
              header: "Date",
              render: (p) =>
                new Date(p.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
            },
            { key: "for", header: "For", render: (p) => p.description ?? humanize(p.purpose) },
            { key: "amount", header: "Amount", render: (p) => money(p.amount, p.currency) },
            {
              key: "refunded",
              header: "Refunded",
              render: (p) => (p.amountRefunded > 0 ? money(p.amountRefunded, p.currency) : "—"),
            },
            {
              key: "status",
              header: "Status",
              render: (p) => <Badge tone={STATUS_TONE[p.status] ?? "neutral"}>{humanize(p.status)}</Badge>,
            },
            {
              key: "ref",
              header: "Reference",
              render: (p) => <code className="text-xs">{p.id.slice(0, 8)}</code>,
            },
          ]}
        />
      )}
      {meta && meta.totalPages > 1 && (
        <Pagination page={meta.page} totalPages={meta.totalPages} hrefFor={hrefFor} />
      )}
    </div>
  );
}
