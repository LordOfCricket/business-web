import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, Pagination } from "@/components/ui";
import { listOrders, money, ORDER_STATUS, type OrderStatus } from "@/features/shop/api";
import { requireSeller } from "@/features/shop/context";

export const metadata: Metadata = { title: "Orders" };

const FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "All" },
  { value: "CONFIRMED", label: "New" },
  { value: "PROCESSING", label: "Packing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "RETURN_REQUESTED", label: "Returns" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

/** Orders to fulfil (spec §16 "View orders", "Manage order fulfillment"). */
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { session, org } = await requireSeller();
  const sp = await searchParams;
  const status = FILTERS.some((f) => f.value === sp.status && f.value) ? sp.status : undefined;
  const page = Math.max(0, Number.parseInt(sp.page ?? "0", 10) || 0);
  const { items, meta } = await listOrders(org.id, session.accessToken, {
    status,
    q: sp.q?.slice(0, 20),
    page,
  });
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Orders</h1>
      <nav aria-label="Order status" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/shop/orders?status=${f.value}` : "/shop/orders"}
            aria-current={(status ?? "") === f.value ? "page" : undefined}
            className="rounded-full border border-line px-3 py-1 text-sm hover:bg-canvas aria-[current=page]:border-brand-600 aria-[current=page]:bg-brand-50"
          >
            {f.label}
          </Link>
        ))}
      </nav>
      {items.length === 0 ? (
        <EmptyState title="No orders here" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Placed</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Items</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="px-3 py-2">
                    <Link href={`/shop/orders/${o.id}`} className="font-medium hover:underline">
                      {o.number}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2">
                    {o.customerName}
                    {o.city ? `, ${o.city}` : ""}
                  </td>
                  <td className="px-3 py-2">{o.itemCount}</td>
                  <td className="px-3 py-2">{money(o.total, o.currency)}</td>
                  <td className="px-3 py-2">
                    <Badge tone={o.status === "CONFIRMED" || o.openReturn ? "warning" : "neutral"}>
                      {ORDER_STATUS[o.status as OrderStatus]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={page}
        totalPages={meta?.totalPages ?? 0}
        hrefFor={(p) => `/shop/orders?page=${p}${status ? `&status=${status}` : ""}`}
      />
    </div>
  );
}
