import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listBrands, listShopSports } from "@/features/shop/api";
import { launchedOrKept } from "@/lib/sports/launch";
import { requireSeller } from "@/features/shop/context";
import { NewProductForm } from "@/features/shop/ProductEditor";

export const metadata: Metadata = { title: "Add product" };

/** Seller dashboard "Add product" (spec §13, §16). */
export default async function NewProductPage() {
  const { org, manager } = await requireSeller();
  if (!manager) redirect("/shop/products");
  const [shopSports, brands] = await Promise.all([listShopSports(), listBrands()]);
  // new products are listed under launched sports only
  const sports = launchedOrKept(shopSports);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Add product</h1>
      <NewProductForm orgId={org.id} sports={sports} brands={brands} />
    </div>
  );
}
