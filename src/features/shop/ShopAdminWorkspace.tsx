"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input } from "@/components/ui";
import { ShopIcon, ShieldCheckIcon, CheckmarkIcon } from "@/components/landing/LandingIcons";

interface Props {
  orgId: string;
}

const SHOP_TABS = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products (Sport-First)" },
  { id: "categories", label: "Categories Tree" },
  { id: "inventory", label: "Inventory & Variants" },
  { id: "orders", label: "Orders (34)" },
  { id: "customers", label: "Customers" },
  { id: "discounts", label: "Discounts & Coupons" },
  { id: "shipping", label: "Shipping & Logistics" },
  { id: "reports", label: "Sales Reports" },
  { id: "settings", label: "Store Settings" },
];

export function ShopAdminWorkspace({ orgId }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner with Strict Owner Verification Note */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-900">
            <ShopIcon className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="kicker text-[11px] text-brand-700">EXCLUSIVE STORE OPERATOR</span>
              <Badge tone="success">OWNER = LORDOFSPORTZ</Badge>
            </div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">LordOfSportz Official Store Admin</h1>
            <p className="text-xs text-muted">
              Centralized Sports Equipment &amp; Apparel Operations · Single-Seller Phase
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/workspace"
            className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-muted hover:border-ink/30 hover:text-ink"
          >
            Switch Workspace
          </Link>
          <Button size="sm">+ Add Product</Button>
        </div>
      </div>

      {/* Domain Architecture Notice for Future Shopkeepers */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4 text-xs text-brand-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheckIcon className="size-5 shrink-0 text-brand-700" />
          <span>
            <strong>Architectural Policy (Phase 1):</strong> Currently, only LordOfSportz itself operates the shop.
            Public multi-vendor shopkeeper registration is disabled to guarantee authentic gear. The domain
            model is fully structured for verified seller onboarding in future platform phases.
          </span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto border-b border-line pb-1 gap-1">
        {SHOP_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-lg transition ${
              activeTab === tab.id ? "bg-brand-900 text-paper" : "text-muted hover:bg-canvas"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <p className="text-xs font-medium text-muted">Active Products</p>
              <p className="mt-2 text-3xl font-bold text-ink">450+</p>
              <p className="text-xs text-brand-700 mt-1">8 Sports Disciplines</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Pending Orders</p>
              <p className="mt-2 text-3xl font-bold text-ink">34</p>
              <p className="text-xs text-amber-700 mt-1">Ready for packing</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Low Stock Alerts</p>
              <p className="mt-2 text-3xl font-bold text-ink">6 SKUs</p>
              <p className="text-xs text-danger mt-1">Reorder threshold reached</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Gross Sales (MTD)</p>
              <p className="mt-2 text-3xl font-bold text-ink">₹12,84,500</p>
              <p className="text-xs text-brand-700 mt-1">↑ 18% vs last month</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <span className="kicker text-[11px] text-brand-700">RECENT STORE ORDERS</span>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-line bg-canvas text-muted">
                    <tr>
                      <th className="p-2.5">Order ID</th>
                      <th className="p-2.5">Customer / Academy</th>
                      <th className="p-2.5">Items</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {[
                      { id: "ORD-9481", cust: "Apex Cricket Academy", items: "12x Leather Balls, 4x Bats", amt: "₹48,200", status: "CONFIRMED" },
                      { id: "ORD-9482", cust: "Shihan Rajiv Sharma", items: "25x Heavyweight Gi (White)", amt: "₹62,500", status: "PACKING" },
                      { id: "ORD-9483", cust: "Royal Warriors Club", items: "16x Custom Match Jerseys", amt: "₹19,200", status: "DISPATCHED" },
                    ].map((ord) => (
                      <tr key={ord.id}>
                        <td className="p-2.5 font-semibold text-ink">{ord.id}</td>
                        <td className="p-2.5 text-muted">{ord.cust}</td>
                        <td className="p-2.5 text-muted">{ord.items}</td>
                        <td className="p-2.5 font-bold text-ink">{ord.amt}</td>
                        <td className="p-2.5"><Badge tone="success">{ord.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <span className="kicker text-[11px] text-brand-700">TOP SELLING SPORTS GEAR</span>
              <ul className="mt-3 flex flex-col gap-2.5 text-xs">
                <li className="flex items-center justify-between p-2 rounded-xl bg-canvas ring-1 ring-line">
                  <span><strong>LordOfSportz Pro Grade 1 English Willow Bat</strong> (Short Handle, 1180g)</span>
                  <span className="font-bold text-brand-900">42 sold</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-xl bg-canvas ring-1 ring-line">
                  <span><strong>Heavyweight 14oz Japanese Cut Kata Gi</strong> (Sizes 3 - 6)</span>
                  <span className="font-bold text-brand-900">68 sold</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-xl bg-canvas ring-1 ring-line">
                  <span><strong>High-Seam White Turf Cricket Match Balls (Pack of 12)</strong></span>
                  <span className="font-bold text-brand-900">110 boxes</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Products (Sport-First Hierarchy) */}
      {activeTab === "products" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-ink">Sport-First Products Catalog</h3>
              <p className="text-xs text-muted">Specialized athletic gear with sports specifications, variants, and stock</p>
            </div>
            <Button size="sm">+ New Product</Button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-canvas text-muted">
                <tr>
                  <th className="p-3">Product Name &amp; SKU</th>
                  <th className="p-3">Sport</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Variants</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {[
                  { name: "Pro Grade 1 English Willow", sku: "CRK-BAT-01", sport: "Cricket", cat: "Bats", vars: "SH / LH (1160g-1220g)", price: "₹18,500", stock: "28 in stock", status: "ACTIVE" },
                  { name: "White Leather 4-Piece Turf Ball", sku: "CRK-BAL-04", sport: "Cricket", cat: "Balls", vars: "Box of 12 (156g)", price: "₹4,200", stock: "140 boxes", status: "ACTIVE" },
                  { name: "Heavyweight 14oz Canvas Kata Gi", sku: "KAR-GI-14", sport: "Karate", cat: "Uniforms", vars: "Sizes 3, 4, 5, 6", price: "₹3,200", stock: "45 in stock", status: "ACTIVE" },
                  { name: "WKF Silk Kumite Belts", sku: "KAR-BLT-01", sport: "Karate", cat: "Belts", vars: "Red / Blue (260cm-300cm)", price: "₹650", stock: "80 in stock", status: "ACTIVE" },
                  { name: "Elite 5v5 Futsal Match Ball", sku: "FTB-BAL-05", sport: "Football", cat: "Balls", vars: "Size 4 (Low Bounce)", price: "₹1,400", stock: "62 in stock", status: "ACTIVE" },
                ].map((p) => (
                  <tr key={p.sku}>
                    <td className="p-3 font-semibold text-ink">
                      {p.name}
                      <span className="block text-[10px] font-mono text-muted">{p.sku}</span>
                    </td>
                    <td className="p-3"><Badge tone="neutral">{p.sport}</Badge></td>
                    <td className="p-3 text-muted">{p.cat}</td>
                    <td className="p-3 text-muted">{p.vars}</td>
                    <td className="p-3 font-bold text-ink">{p.price}</td>
                    <td className="p-3 text-brand-700 font-medium">{p.stock}</td>
                    <td className="p-3"><Badge tone="success">{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Categories Tree */}
      {activeTab === "categories" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-base font-semibold text-ink">Sport-First Hierarchical Categories</h3>
          <p className="text-xs text-muted">Sport &rarr; Category &rarr; Subcategory structure engineered for future multi-vendor marketplace</p>

          <div className="grid gap-4 sm:grid-cols-3 mt-2 text-xs">
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <span className="font-bold text-brand-900 text-sm">🏏 Cricket</span>
              <ul className="mt-3 flex flex-col gap-1.5 text-muted">
                <li>• Bats (English Willow, Kashmir Willow, Tennis Ball)</li>
                <li>• Balls (Red Leather, White Turf, Pink Day/Night)</li>
                <li>• Protective (Pads, Gloves, Helmets, Thigh Guards)</li>
                <li>• Accessories (Grip, Mallets, Linseed Oil, Bat Covers)</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <span className="font-bold text-brand-900 text-sm">🥋 Karate &amp; Martial Arts</span>
              <ul className="mt-3 flex flex-col gap-1.5 text-muted">
                <li>• Uniforms / Gi (Traditional Kata Gi, Ultralight Kumite Gi)</li>
                <li>• Belts (Kyu Belts, Silk Dan Black Belts)</li>
                <li>• Protective Equipment (Shin Guards, Foot Guards, Chest Guards)</li>
                <li>• Training Gear (Makiwara, Focus Mitts, Kick Shields)</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <span className="font-bold text-brand-900 text-sm">⚽ Football &amp; Turf</span>
              <ul className="mt-3 flex flex-col gap-1.5 text-muted">
                <li>• Footwear (Firm Ground Cleats, Astro Turf Shoes)</li>
                <li>• Balls (FIFA Match Balls, Futsal Low Bounce)</li>
                <li>• Goalkeeper (Latex Grip Gloves, Padded Pants)</li>
                <li>• Teamwear (Training Bibs, Custom Match Kits)</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Inventory */}
      {activeTab === "inventory" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">Stock &amp; Inventory Management</h3>
            <Button size="sm">Export Stock Sheet</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 mt-2">
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line text-xs">
              <p className="text-muted">Total Stock Value</p>
              <p className="text-2xl font-bold text-ink mt-1">₹34,50,000</p>
            </div>
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line text-xs">
              <p className="text-muted">Warehouse Locations</p>
              <p className="text-2xl font-bold text-ink mt-1">2 Centers (Mumbai &amp; Delhi)</p>
            </div>
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line text-xs">
              <p className="text-muted">Average Dispatch Time</p>
              <p className="text-2xl font-bold text-ink mt-1">24 Hours</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
