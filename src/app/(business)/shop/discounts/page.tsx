import type { Metadata } from "next";
import { Badge, Card, EmptyState } from "@/components/ui";
import { listDiscounts, listProducts, money } from "@/features/shop/api";
import { requireSeller } from "@/features/shop/context";
import { DiscountForm } from "@/features/shop/ShopControls";

export const metadata: Metadata = { title: "Discounts" };

/** Discount codes (spec §16 "Set prices and discounts"). */
export default async function DiscountsPage() {
  const { session, org, manager } = await requireSeller();
  const [discounts, products] = await Promise.all([
    listDiscounts(org.id, session.accessToken),
    listProducts(org.id, session.accessToken, { page: 0 }),
  ]);
  const productOptions = products.items.map((p) => ({ id: p.id, name: p.name }));
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Discounts</h1>
      <p className="text-sm text-muted">
        Show a sale price by setting an “MRP / was” price on a product option; use codes for promotions.
      </p>
      {manager && <DiscountForm orgId={org.id} products={productOptions} />}
      {discounts.length === 0 ? (
        <EmptyState title="No discount codes yet" />
      ) : manager ? (
        discounts.map((d) => (
          <DiscountForm key={d.id} orgId={org.id} discount={d} products={productOptions} />
        ))
      ) : (
        <ul className="flex flex-col gap-2">
          {discounts.map((d) => (
            <li key={d.id}>
              <Card className="flex flex-wrap items-center gap-3">
                <strong>{d.code}</strong>
                <span className="text-sm">
                  {d.type === "PERCENT" ? `${d.value}% off` : `${money(d.value)} off`}
                </span>
                <Badge tone={d.active ? "success" : "neutral"}>{d.active ? "active" : "inactive"}</Badge>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
