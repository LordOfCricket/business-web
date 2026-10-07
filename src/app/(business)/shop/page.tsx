import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { requireBusiness } from "@/features/org/context";
import { getSellerProfile, listOrders, listProducts } from "@/features/shop/api";
import { SellerProfileForm } from "@/features/shop/SellerProfileForm";

export const metadata: Metadata = { title: "Shop" };

/** Seller home (spec §13): onboarding first, then shortcuts to products, inventory, orders and sales. */
export default async function ShopHomePage() {
  const { session, org, capabilities, manager } = await requireBusiness();
  if (!capabilities.includes("SELLER")) {
    return (
      <EmptyState
        title="Selling needs the Seller capability"
        description="Request it in Business settings; the LordOfSportz team reviews it with your verification."
        action={
          <Link href="/settings" className="font-medium text-brand-700 hover:underline">
            Business settings →
          </Link>
        }
      />
    );
  }
  const profile = await getSellerProfile(org.id, session.accessToken);
  const [products, newOrders] = profile
    ? await Promise.all([
        listProducts(org.id, session.accessToken, { page: 0 }),
        listOrders(org.id, session.accessToken, { status: "CONFIRMED", page: 0 }),
      ])
    : [null, null];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Shop</h1>
        {profile && (
          <Badge tone={profile.canSell ? "success" : "danger"}>
            {profile.canSell
              ? "Selling"
              : profile.status === "SUSPENDED"
                ? `Suspended: ${profile.suspensionReason ?? ""}`
                : "Not selling (business not verified)"}
          </Badge>
        )}
      </div>
      {profile && products && newOrders && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="flex flex-col gap-1">
            <p className="text-sm text-muted">Products</p>
            <p className="text-2xl font-bold">{products.meta?.total ?? products.items.length}</p>
            <Link href="/shop/products" className="text-sm font-medium text-brand-700 hover:underline">
              Manage products →
            </Link>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-sm text-muted">New orders to pack</p>
            <p className="text-2xl font-bold">{newOrders.meta?.total ?? newOrders.items.length}</p>
            <Link href="/shop/orders" className="text-sm font-medium text-brand-700 hover:underline">
              View orders →
            </Link>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-sm text-muted">Sales</p>
            <Link href="/shop/sales" className="text-sm font-medium text-brand-700 hover:underline">
              View sales →
            </Link>
          </Card>
        </div>
      )}
      {manager ? (
        <SellerProfileForm
          orgId={org.id}
          profile={profile}
          defaults={{ displayName: org.name, email: org.contactEmail, city: org.city }}
        />
      ) : (
        !profile && <EmptyState title="An owner or manager must set up the shop first." />
      )}
    </div>
  );
}
