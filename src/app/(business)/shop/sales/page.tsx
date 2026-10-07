import type { Metadata } from "next";
import { Card, EmptyState } from "@/components/ui";
import { getSales, money } from "@/features/shop/api";
import { requireSeller } from "@/features/shop/context";

export const metadata: Metadata = { title: "Sales" };

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Server component: rendered once per request, so "today" is the request date. */
function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

function daysBefore(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/** View Sales (spec §13): paid orders in a period, by day and by product. */
export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { session, org } = await requireSeller();
  const sp = await searchParams;
  const to = DATE.test(sp.to ?? "") ? sp.to! : today();
  const from = DATE.test(sp.from ?? "") ? sp.from! : daysBefore(to, 29);
  const sales = await getSales(org.id, session.accessToken, from, to);
  const max = Math.max(1, ...sales.byDay.map((d) => d.revenue));
  const field = "h-10 rounded-xl border border-ink/15 bg-surface px-3 text-sm hover:border-ink/35";
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Sales</h1>
      <form className="flex flex-wrap items-end gap-3" action="/shop/sales">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">From</span>
          <input type="date" name="from" defaultValue={from} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">To</span>
          <input type="date" name="to" defaultValue={to} className={field} />
        </label>
        <button type="submit" className="h-10 rounded-lg border border-line px-4 text-sm hover:bg-canvas">
          Show
        </button>
      </form>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Orders", String(sales.orders)],
          ["Items sold", String(sales.itemsSold)],
          ["Gross sales", money(sales.gross, sales.currency)],
          ["Net of refunds", money(sales.net, sales.currency)],
        ].map(([label, value]) => (
          <Card key={label} className="flex flex-col gap-1">
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>
      {sales.orders === 0 ? (
        <EmptyState title="No paid orders in this period" />
      ) : (
        <>
          <Card className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">By day</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {sales.byDay.map((d) => (
                <li key={d.date} className="grid grid-cols-[6rem_1fr_7rem] items-center gap-2">
                  <span>{d.date}</span>
                  <span
                    className="h-3 rounded bg-brand-600"
                    style={{ width: `${(d.revenue / max) * 100}%` }}
                  />
                  <span className="text-right">{money(d.revenue, sales.currency)}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Top products</h2>
            <ol className="flex flex-col gap-1 text-sm">
              {sales.topProducts.map((p) => (
                <li key={p.productId} className="flex justify-between gap-3">
                  <span>
                    {p.name} · {p.units} sold
                  </span>
                  <span>{money(p.revenue, sales.currency)}</span>
                </li>
              ))}
            </ol>
          </Card>
          <p className="text-xs text-muted">
            Discounts given: {money(sales.discounts, sales.currency)} · Refunded:{" "}
            {money(sales.refunded, sales.currency)}. Amounts include GST and delivery charges.
          </p>
        </>
      )}
    </div>
  );
}
