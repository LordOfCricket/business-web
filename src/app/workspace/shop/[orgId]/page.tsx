import type { Metadata } from "next";
import { ShopAdminWorkspace } from "@/features/shop/ShopAdminWorkspace";

export const metadata: Metadata = {
  title: "LOS Shop Operations · LordOfSportz Business",
  description: "Official LordOfSportz store operations, products, inventory, orders, and fulfillment.",
};

export default async function ShopWorkspacePage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  return <ShopAdminWorkspace orgId={orgId} />;
}
