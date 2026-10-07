import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge, Card, EmptyState, Pagination } from "@/components/ui";
import { listProducts, money } from "@/features/shop/api";
import { requireSeller } from "@/features/shop/context";

export const metadata: Metadata = { title: "Products" };

const STATUS_TONE = { ACTIVE: "success", DRAFT: "warning", INACTIVE: "neutral" } as const;

/** Seller products (spec §16 "Add / edit / deactivate products"). */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { session, org, manager } = await requireSeller();
  const sp = await searchParams;
  const status = ["DRAFT", "ACTIVE", "INACTIVE"].includes(sp.status ?? "") ? sp.status : undefined;
  const page = Math.max(0, Number.parseInt(sp.page ?? "0", 10) || 0);
  const { items, meta } = await listProducts(org.id, session.accessToken, {
    status,
    q: sp.q?.slice(0, 100),
    page,
  });
  const field = "h-10 rounded-xl border border-ink/15 bg-surface px-3 text-sm hover:border-ink/35";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Products</h1>
        {manager && (
          <Link
            href="/shop/products/new"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-brand-900"
          >
            Add product
          </Link>
        )}
      </div>
      <form className="flex flex-wrap items-end gap-3" action="/shop/products">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search by name"
          aria-label="Search"
          className={field}
        />
        <select name="status" defaultValue={status ?? ""} aria-label="Status" className={field}>
          <option value="">All</option>
          <option value="ACTIVE">Live</option>
          <option value="DRAFT">Draft</option>
          <option value="INACTIVE">Hidden</option>
        </select>
        <button type="submit" className="h-10 rounded-lg border border-line px-4 text-sm hover:bg-canvas">
          Filter
        </button>
      </form>
      {items.length === 0 ? (
        <EmptyState title="No products yet" description="Add your first product to start selling." />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((p) => (
            <li key={p.id}>
              <Card className="flex items-center gap-4 p-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-canvas">
                  {p.imageUrl && (
                    <Image src={p.imageUrl} alt="" fill sizes="56px" unoptimized className="object-cover" />
                  )}
                </div>
                <Link href={`/shop/products/${p.id}`} className="flex-1 font-medium hover:underline">
                  {p.name}
                </Link>
                <span className="text-sm">
                  {p.minPrice != null ? `from ${money(p.minPrice)}` : "no price yet"}
                </span>
                <Badge tone={STATUS_TONE[p.status]}>
                  {p.status === "INACTIVE" ? "hidden" : p.status.toLowerCase()}
                </Badge>
                {p.unlisted && <Badge tone="danger">unlisted</Badge>}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={page}
        totalPages={meta?.totalPages ?? 0}
        hrefFor={(p) => `/shop/products?page=${p}${status ? `&status=${status}` : ""}`}
      />
    </div>
  );
}
