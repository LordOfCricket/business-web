import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, listBrands, listShopSports } from "@/features/shop/api";
import { requireSeller } from "@/features/shop/context";
import { ProductEditor } from "@/features/shop/ProductEditor";
import { serverEnv } from "@/lib/env";
import { launchedOrKept } from "@/lib/sports/launch";

export const metadata: Metadata = { title: "Product" };

/** Manage one product: details, sports, categories, images, options (price, stock), going live. */
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, org, manager } = await requireSeller();
  const [product, sports, brands] = await Promise.all([
    getProduct(org.id, id, session.accessToken),
    listShopSports(),
    listBrands(),
  ]);
  if (!product) notFound();
  return (
    <div className="flex flex-col gap-6">
      <Link href="/shop/products" className="text-sm font-medium text-brand-700 hover:underline">
        ← Products
      </Link>
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">{product.name}</h1>
      <ProductEditor
        orgId={org.id}
        product={product}
        sports={launchedOrKept(sports, product.sports)}
        brands={brands}
        manager={manager}
        customerSiteUrl={serverEnv().CUSTOMER_SITE_URL}
      />
    </div>
  );
}
