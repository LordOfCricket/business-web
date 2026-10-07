import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { getOrder, money, ORDER_STATUS, type OrderStatus } from "@/features/shop/api";
import { requireSeller } from "@/features/shop/context";
import { OrderControls } from "@/features/shop/ShopControls";

export const metadata: Metadata = { title: "Order" };

/** One order: items, delivery address, fulfilment steps, returns (spec §16, §20). */
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, org } = await requireSeller();
  const order = await getOrder(org.id, id, session.accessToken);
  if (!order) notFound();
  const m = (n: number) => money(n, order.currency);
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/shop/orders" className="text-sm font-medium text-brand-700 hover:underline">
        ← Orders
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Order {order.number}</h1>
        <Badge tone="neutral">{ORDER_STATUS[order.status]}</Badge>
      </div>
      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Next step</h2>
        {order.status === "PENDING" ? (
          <p className="text-sm text-muted">Waiting for the customer to pay. Nothing to do yet.</p>
        ) : (
          <OrderControls
            orgId={org.id}
            orderId={order.id}
            next={order.nextStatuses}
            returnRequest={order.returnRequest}
          />
        )}
        {order.nextStatuses.length === 0 && !order.returnRequest && order.status !== "PENDING" && (
          <p className="text-sm text-muted">This order is complete.</p>
        )}
        {order.trackingNo && (
          <p className="text-sm">
            Tracking: {order.trackingCarrier} {order.trackingNo}
          </p>
        )}
        {order.returnRequest && (
          <p className="text-sm">
            Return ({order.returnRequest.status.toLowerCase()}): “{order.returnRequest.reason}”
          </p>
        )}
        {order.cancellationReason && <p className="text-sm">Cancelled: {order.cancellationReason}</p>}
        {order.refundAmount != null && <p className="text-sm">Refunded: {m(order.refundAmount)}</p>}
      </Card>
      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Items</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((i) => (
            <li key={i.sku} className="flex justify-between gap-3">
              <span>
                {i.quantity} × {i.productName} ({i.variantLabel}){" "}
                <span className="font-mono text-xs">{i.sku}</span>
              </span>
              <span>{m(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 border-t border-line pt-2 text-sm">
          <dt>Subtotal</dt>
          <dd className="text-right">{m(order.subtotal)}</dd>
          {order.discount > 0 && (
            <>
              <dt>Discount</dt>
              <dd className="text-right">−{m(order.discount)}</dd>
            </>
          )}
          <dt>Delivery</dt>
          <dd className="text-right">{m(order.deliveryCharge)}</dd>
          <dt className="font-semibold">Total (incl. GST {m(order.tax)})</dt>
          <dd className="text-right font-semibold">{m(order.total)}</dd>
        </dl>
      </Card>
      {order.shipTo && (
        <Card className="text-sm">
          <h2 className="mb-1 text-lg font-semibold">Ship to</h2>
          <p>
            {order.shipTo.name} · {order.shipTo.phone}
          </p>
          <p>
            {[
              order.shipTo.line1,
              order.shipTo.line2,
              order.shipTo.city,
              order.shipTo.state,
              order.shipTo.postalCode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </Card>
      )}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">History</h2>
        <ol className="flex flex-col gap-1 text-sm">
          {order.history.map((h, i) => (
            <li key={`${h.status}-${i}`}>
              <span className="text-muted">{new Date(h.at).toLocaleString("en-IN")}</span> —{" "}
              {ORDER_STATUS[h.status as OrderStatus] ?? h.status}
              {h.note ? ` (${h.note})` : ""}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
