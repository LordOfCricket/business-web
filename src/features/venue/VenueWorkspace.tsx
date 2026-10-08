"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input } from "@/components/ui";
import {
  VenueIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckmarkIcon,
} from "@/components/landing/LandingIcons";

interface Props {
  orgId: string;
  venueName?: string;
}

const VENUE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Venue Profile" },
  { id: "pitches", label: "Grounds & Pitches (3)" },
  { id: "amenities", label: "Facilities & Amenities" },
  { id: "bookings", label: "Bookings Calendar" },
  { id: "pricing", label: "Dynamic Pricing Rules" },
  { id: "staff", label: "Ground Staff" },
  { id: "reviews", label: "Reviews" },
  { id: "reports", label: "Utilization & Reports" },
  { id: "settings", label: "Settings" },
];

export function VenueWorkspace({ orgId, venueName = "LOS Sports Arena & Turf" }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col gap-6">
      {/* Venue Header Banner */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-900">
            <VenueIcon className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="kicker text-[11px] text-brand-700">VENUE OPERATOR WORKSPACE</span>
              <Badge tone="success">Active Ground</Badge>
            </div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{venueName}</h1>
            <p className="text-xs text-muted">
              Cricket &amp; Football Multi-Sport Arena · 3 Grounds · 6 Practice Nets · Mumbai
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/workspace"
            className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-muted hover:border-ink/30 hover:text-ink"
          >
            Switch Workspace
          </Link>
          <Button size="sm">
            + Block Maintenance Slot
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto border-b border-line pb-1 gap-1">
        {VENUE_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-4 py-2 text-xs font-semibold whitespace-nowrap transition rounded-lg ${
                active
                  ? "bg-brand-900 text-paper shadow-2xs"
                  : "text-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-xs font-medium text-muted">Today&apos;s Booked Slots</p>
              <p className="mt-2 text-3xl font-bold text-ink">14 Slots</p>
              <p className="mt-1 text-xs text-brand-700">92% Weekend Occupancy</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Active Grounds &amp; Courts</p>
              <p className="mt-2 text-3xl font-bold text-ink">3 Pitches</p>
              <p className="mt-1 text-xs text-muted">+ 6 Automated Nets</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Estimated Month Revenue</p>
              <p className="mt-2 text-3xl font-bold text-ink">₹5,20,000</p>
              <p className="mt-1 text-xs text-brand-700">↑ 14% vs last month</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Average Rating</p>
              <p className="mt-2 text-3xl font-bold text-ink">4.88 ★</p>
              <p className="mt-1 text-xs text-muted">142 Player Reviews</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <span className="kicker text-[11px] text-brand-700">CRICKET SPECIFICATIONS</span>
              <h3 className="mt-2 text-lg font-semibold text-ink">BCCI Standard Natural Turf Pitch</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                68m straight boundaries, 65m square boundaries. Certified clay turf with high-drainage sub-base,
                practice nets with automated bowling machines, and 400 Lux broadcast-level floodlights.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-canvas px-3 py-1 text-muted">Pavilion (120 Capacity)</span>
                <span className="rounded-lg bg-canvas px-3 py-1 text-muted">2 AC Dressing Rooms</span>
                <span className="rounded-lg bg-canvas px-3 py-1 text-muted">Electronic Scoreboard</span>
              </div>
            </Card>

            <Card>
              <span className="kicker text-[11px] text-brand-700">SLOT ENGINE STATUS</span>
              <h3 className="mt-2 text-lg font-semibold text-ink">Night Floodlight Sessions</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Evening 6:00 PM - 10:00 PM slots operate on dynamic weekend peak surge (+25%).
                Full pitch lights automated via facility control panel.
              </p>
              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={() => setActiveTab("bookings")}>
                  Open Live Slot Grid →
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Venue Profile */}
      {activeTab === "profile" && (
        <Card className="flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-ink">Ground &amp; Venue Profile</h3>
          <p className="text-xs text-muted">Public facility details, location, directions, and ground rules</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Venue Name" defaultValue={venueName} />
            <Input label="City" defaultValue="Mumbai" />
            <Input label="Address" defaultValue="Sports Enclave, Plot 42, Western Expressway" />
            <Input label="Postal Code" defaultValue="400050" />
            <Input label="Contact Phone" defaultValue="+91 98201 88776" />
            <Input label="Spectator Capacity" defaultValue="500 Seated" />
            <Input label="Operating Hours" defaultValue="06:00 AM - 11:00 PM Daily" />
            <Input label="Ground Rule Policy" defaultValue="Spikes allowed on turf only; rubber studs on nets" />
          </div>
          <div className="flex justify-end pt-4 border-t border-line">
            <Button>Save Venue Profile</Button>
          </div>
        </Card>
      )}

      {/* Tab: Grounds & Pitches */}
      {activeTab === "pitches" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Grounds, Courts &amp; Pitches</h3>
            <Button size="sm">+ Add Facility / Pitch</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                name: "Main Cricket Stadium (Ground A)",
                sport: "Cricket",
                spec: "68m Boundary · Natural Clay Turf · Pavilion & Scoreboard",
                rate: "₹3,500 / hr",
              },
              {
                name: "Astro Turf Arena (Ground B)",
                sport: "Football 7v7 / Box Cricket",
                spec: "FIFA 2-Star Astro Turf · High-Fence Rebound Nets",
                rate: "₹2,200 / hr",
              },
              {
                name: "High-Performance Practice Nets (Bay 1-6)",
                sport: "Cricket Nets",
                spec: "6 Automated Bowling Machine Bays · Astro & Matting",
                rate: "₹800 / hr per net",
              },
            ].map((p) => (
              <Card key={p.name} className="flex flex-col justify-between">
                <div>
                  <Badge tone="neutral">{p.sport}</Badge>
                  <h4 className="mt-2 text-base font-semibold text-ink">{p.name}</h4>
                  <p className="mt-2 text-xs text-muted">{p.spec}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-900">{p.rate}</span>
                  <Button size="sm" variant="secondary">Edit Specs</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Facilities & Amenities */}
      {activeTab === "amenities" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-ink">Venue Facilities &amp; Amenities</h3>
          <p className="text-xs text-muted">Amenities visible to athletes and tournament organizers</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-2">
            {[
              "400 Lux LED Floodlights",
              "AC Player Dressing Rooms (Home & Away)",
              "Digital LED Scoreboard with Remote App",
              "Official Commentary & Match Desk",
              "Cafeteria & Sports Hydration Bar",
              "Parking (120 Cars + 200 Two-Wheelers)",
              "Practice Batting Nets with Bowling Machine",
              "First Aid & Paramedic Treatment Room",
            ].map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 rounded-xl bg-canvas p-3 ring-1 ring-line text-xs">
                <CheckmarkIcon className="size-4 text-brand-600 shrink-0" />
                <span className="font-medium text-ink">{amenity}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Bookings Calendar */}
      {activeTab === "bookings" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Real-Time Bookings Grid</h3>
              <p className="text-xs text-muted">Slot reservations, maintenance blackout periods, and online bookings</p>
            </div>
            <Button size="sm">+ Manual Booking</Button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-canvas text-muted">
                <tr>
                  <th className="p-3">Time Slot</th>
                  <th className="p-3">Ground A (Main Turf)</th>
                  <th className="p-3">Ground B (Astro Arena)</th>
                  <th className="p-3">Practice Nets (Bays 1-6)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {[
                  { time: "06:00 AM - 08:00 AM", a: "Morning Corporate XI", b: "Open Slot", c: "4/6 Nets Booked" },
                  { time: "08:00 AM - 10:00 AM", a: "Academy Squad Drill", b: "Futsal Youth League", c: "Full (Coaching)" },
                  { time: "10:00 AM - 02:00 PM", a: "Pitch Watering & Rolling", b: "Open Slot", c: "Maintenance" },
                  { time: "04:00 PM - 06:00 PM", a: "T20 League Match 1", b: "City FC 7v7", c: "6/6 Nets Booked" },
                  { time: "06:00 PM - 10:00 PM", a: "Corporate Floodlight Final", b: "Open Slot", c: "5/6 Nets Booked" },
                ].map((row) => (
                  <tr key={row.time}>
                    <td className="p-3 font-semibold text-ink whitespace-nowrap">{row.time}</td>
                    <td className="p-3">
                      <span className="rounded bg-brand-50 px-2 py-0.5 text-brand-900 font-medium">
                        {row.a}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-canvas px-2 py-0.5 text-muted font-medium">
                        {row.b}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-900 font-medium">
                        {row.c}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Dynamic Pricing Rules */}
      {activeTab === "pricing" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-ink">Dynamic Hourly Pricing Rules</h3>
          <p className="text-xs text-muted">Configure off-peak discounts, weekend rates, and floodlight surcharges</p>
          <div className="grid gap-3 sm:grid-cols-3 mt-2">
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <span className="kicker text-[10px] text-brand-700">WEEKDAY REGULAR</span>
              <p className="mt-1 text-lg font-bold text-ink">₹2,800 / hr</p>
              <p className="text-xs text-muted">Mon - Thu, 06:00 AM - 05:00 PM</p>
            </div>
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <span className="kicker text-[10px] text-amber-700">EVENING FLOODLIGHT</span>
              <p className="mt-1 text-lg font-bold text-ink">₹3,800 / hr</p>
              <p className="text-xs text-muted">All Days, 06:00 PM - 11:00 PM</p>
            </div>
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <span className="kicker text-[10px] text-purple-700">WEEKEND SURGE</span>
              <p className="mt-1 text-lg font-bold text-ink">₹4,200 / hr</p>
              <p className="text-xs text-muted">Sat - Sun All Day</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Ground Staff */}
      {activeTab === "staff" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Ground &amp; Operations Staff</h3>
            <Button size="sm">+ Add Staff</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 mt-2">
            {[
              { name: "Mahesh Kulkarni", role: "Head Curator & Pitch Master", phone: "+91 98201 12341" },
              { name: "Ramesh Pawar", role: "Facility Operations Manager", phone: "+91 98201 12342" },
              { name: "Sunil Yadav", role: "Electrical & Floodlights In-Charge", phone: "+91 98201 12343" },
            ].map((s) => (
              <div key={s.name} className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                <h4 className="font-semibold text-ink text-sm">{s.name}</h4>
                <p className="text-xs text-brand-700 mt-0.5">{s.role}</p>
                <p className="text-xs text-muted mt-2">{s.phone}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Reviews */}
      {activeTab === "reviews" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-ink">Venue Reviews</h3>
          <p className="text-xs text-muted">Player feedback on turf quality, floodlight brightness, and pavilion hospitality</p>
          <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line text-xs mt-2">
            <div className="flex justify-between items-center">
              <strong>Mumbai Corporate League (Organizer)</strong>
              <span className="text-amber-600 font-bold">★★★★★</span>
            </div>
            <p className="mt-2 text-muted">
              Pristine outfield condition and true bounce on the natural clay turf. The remote digital scoreboard and player changing rooms made hosting our 16-team tournament seamless.
            </p>
          </div>
        </Card>
      )}

      {/* Tab: Reports */}
      {activeTab === "reports" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-ink">Venue Analytics &amp; Utilization</h3>
          <p className="text-xs text-muted">Occupancy trends, peak booking hours, and maintenance costs</p>
          <div className="grid gap-3 sm:grid-cols-3 mt-2">
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <p className="text-xs text-muted">Weekly Court Utilization</p>
              <p className="text-2xl font-bold text-ink mt-1">88.4%</p>
            </div>
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <p className="text-xs text-muted">Most Booked Slot</p>
              <p className="text-2xl font-bold text-ink mt-1">7:00 PM - 9:00 PM</p>
            </div>
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <p className="text-xs text-muted">Repeat Booking Rate</p>
              <p className="text-2xl font-bold text-ink mt-1">74%</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Settings */}
      {activeTab === "settings" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-ink">Venue Management Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            <Input label="Booking Buffer Duration" defaultValue="15 Minutes" />
            <Input label="Cancellation Window" defaultValue="24 Hours Notice (80% Refund)" />
            <Input label="Rain Blackout Policy" defaultValue="Automated Reschedule or Credit Voucher" />
            <Input label="Max Advance Booking Days" defaultValue="30 Days" />
          </div>
          <div className="flex justify-end pt-4 border-t border-line">
            <Button>Save Settings</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
