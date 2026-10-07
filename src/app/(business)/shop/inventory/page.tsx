import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, Pagination } from "@/components/ui";
import { listInventory } from "@/features/shop/api";
import { requireSeller } from "@/features/shop/context";
import { StockCell } from "@/features/shop/ShopControls";

export const metadata: Metadata = { title: "Inventory" };

/** Stock per option (spec §16 "Manage inventory and stock"). "Held" = units in unpaid orders. */
export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ low?: string; page?: string }>;
}) {
  const { session, org } = await requireSeller();
  const sp = await searchParams;
  const lowOnly = sp.low === "1";
  const page = Math.max(0, Number.parseInt(sp.page ?? "0", 10) || 0);
  const { items, meta } = await listInventory(org.id, session.accessToken, lowOnly, page);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Inventory</h1>
        <Link
          href={lowOnly ? "/shop/inventory" : "/shop/inventory?low=1"}
          className="rounded-full border border-ink/15 px-3 py-2 text-sm hover:border-ink/40"
        >
          {lowOnly ? "Show all" : "Low stock only"}
        </Link>
      </div>
      {items.length === 0 ? (
        <EmptyState title={lowOnly ? "Nothing is running low" : "No product options yet"} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Option</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Held</th>
                <th className="px-3 py-2 font-medium">Available</th>
                <th className="px-3 py-2 font-medium">On hand</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.variantId} className="border-t border-line">
                  <td className="px-3 py-2">
                    <Link href={`/shop/products/${row.productId}`} className="hover:underline">
                      {row.productName}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {row.label} {!row.enabled && <Badge>off sale</Badge>}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                  <td className="px-3 py-2">{row.reserved}</td>
                  <td className="px-3 py-2">
                    {row.available} {row.lowStock && <Badge tone="warning">low</Badge>}
                  </td>
                  <td className="px-3 py-2">
                    <StockCell orgId={org.id} variantId={row.variantId} onHand={row.onHand} />
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
        hrefFor={(p) => `/shop/inventory?page=${p}${lowOnly ? "&low=1" : ""}`}
      />
    </div>
  );
}
