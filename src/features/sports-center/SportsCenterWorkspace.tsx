"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input } from "@/components/ui";
import { SportsCenterIcon } from "@/components/landing/LandingIcons";

interface Props {
  orgId: string;
  name?: string;
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "sports", label: "Multi-Sport Catalog" },
  { id: "facilities", label: "Facilities & Inventory" },
  { id: "memberships", label: "Memberships & Passes" },
  { id: "schedules", label: "Shared Schedules" },
  { id: "pricing", label: "Pricing & Plans" },
];

export function SportsCenterWorkspace({ orgId, name = "Apex Multi-Sport Complex" }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-900">
            <SportsCenterIcon className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="kicker text-[11px] text-brand-700">SPORTS CENTER WORKSPACE</span>
              <Badge tone="success">Multi-Sport Complex</Badge>
            </div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{name}</h1>
            <p className="text-xs text-muted">
              Badminton · Football · Cricket · Martial Arts · Gym &amp; Recovery
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
          <Button size="sm">+ New Member Pass</Button>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-line pb-1 gap-1">
        {TABS.map((tab) => (
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

      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs font-medium text-muted">Total Active Members</p>
              <p className="mt-2 text-3xl font-bold text-ink">410</p>
              <p className="text-xs text-brand-700 mt-1">Multi-facility passes</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Sports Supported</p>
              <p className="mt-2 text-3xl font-bold text-ink">5 Disciplines</p>
              <p className="text-xs text-muted mt-1">Badminton, Football, Cricket, Karate, Gym</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Monthly Pass Revenue</p>
              <p className="mt-2 text-3xl font-bold text-ink">₹8,45,000</p>
              <p className="text-xs text-brand-700 mt-1">↑ 12% YoY</p>
            </Card>
          </div>

          <Card>
            <h3 className="text-base font-semibold text-ink">Multi-Sport Facilities Status</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {[
                { name: "6 BWF Synthetic Badminton Courts", status: "82% Occupancy", icon: "🏸" },
                { name: "5v5 High-Pace Futsal Turf", status: "Full evening bookings", icon: "⚽" },
                { name: "2 Indoor Cricket Batting Cages", status: "Active with bowling machines", icon: "🏏" },
                { name: "Olympic Tatami Martial Arts Hall", status: "Batch running", icon: "🥋" },
                { name: "Strength & Conditioning Floor", status: "45 Athletes checked in", icon: "🏋️" },
              ].map((f) => (
                <div key={f.name} className="rounded-2xl bg-canvas p-4 ring-1 ring-line text-xs">
                  <span className="text-lg">{f.icon}</span>
                  <p className="mt-2 font-semibold text-ink">{f.name}</p>
                  <p className="mt-1 text-muted">{f.status}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "sports" && (
        <Card>
          <h3 className="text-base font-semibold text-ink">Configured Sports Disciplines</h3>
          <p className="text-xs text-muted mt-1">Configure coaching staff, court allocations, and member access</p>
          <div className="grid gap-3 sm:grid-cols-2 mt-4 text-xs">
            {["Badminton (Singles & Doubles)", "Football (Futsal & 5v5)", "Cricket (Indoor Turf Nets)", "Karate & Self-Defense", "Fitness & Athletic Gym"].map((s) => (
              <div key={s} className="rounded-xl bg-canvas p-3 ring-1 ring-line font-medium text-ink">
                • {s}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "memberships" && (
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">Membership &amp; Access Passes</h3>
            <Button size="sm">+ Create Plan</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 mt-4 text-xs">
            {[
              { name: "All-Access Multi-Sport Gold Pass", price: "₹4,500 / month", perks: "Unlimited court access, gym, 2 coaching sessions" },
              { name: "Racquet Sports Premium (Badminton)", price: "₹2,800 / month", perks: "Peak hour booking credits, non-marking shoe locker" },
              { name: "Turf Football & Cricket Squad Pass", price: "₹2,200 / month", perks: "Weekend league entry discounts, team match passes" },
            ].map((p) => (
              <div key={p.name} className="rounded-2xl bg-canvas p-4 ring-1 ring-line flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-ink text-sm">{p.name}</h4>
                  <p className="text-brand-900 font-bold mt-1">{p.price}</p>
                  <p className="text-muted mt-2">{p.perks}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-line">
                  <Button size="sm" variant="secondary" className="w-full">Edit Plan</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
