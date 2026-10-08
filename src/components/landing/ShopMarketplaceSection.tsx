import Link from "next/link";
import { ShopIcon, ShieldCheckIcon, CheckmarkIcon } from "./LandingIcons";

interface ShopCategoryHighlight {
  sport: string;
  items: string[];
}

const CATEGORIES: ShopCategoryHighlight[] = [
  {
    sport: "Cricket Gear",
    items: ["English Willow Bats", "Leather Match Balls", "Pro Batting Pads", "Titanium Helmets", "Wicketkeeping Gloves"],
  },
  {
    sport: "Karate & Martial Arts",
    items: ["Heavyweight Kata Gi", "WKF Approved Kumite Gi", "Silk Grading Belts", "Chest & Shin Protectors"],
  },
  {
    sport: "Football & Turf",
    items: ["FIFA Match Balls", "Firm Ground Cleats", "Goalie Gloves", "Team Kits & Training Bibs"],
  },
  {
    sport: "Racquet Sports",
    items: ["High-Modulus Badminton Racquets", "Feather Shuttlecocks", "Graphite Tennis Racquets", "Championship Balls"],
  },
];

export function ShopMarketplaceSection() {
  return (
    <section aria-labelledby="shop-title" className="py-14 sm:py-20 border-t border-line">
      <div className="rounded-3xl border border-line bg-gradient-to-b from-surface to-canvas/50 p-7 sm:p-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-brand-900">
              <ShopIcon className="size-4" />
              <span className="kicker text-[11px] text-brand-900">OFFICIAL STORE ECOSYSTEM</span>
            </div>

            <h2 id="shop-title" className="display mt-4 text-3xl font-normal text-ink sm:text-5xl">
              Authentic sports equipment &amp; official merchandise
            </h2>

            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              Operated directly by LordOfSportz. Supplying academies, tournament organizers, and athletes with
              genuine, competition-certified sports gear, uniforms, and training accessories.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-muted">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheckIcon className="size-4 text-brand-600" />
                100% Brand Certified by LordOfSportz
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckmarkIcon className="size-4 text-brand-600" />
                Direct Academy Bulk Fulfillment
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 text-left lg:w-80 shrink-0">
            <span className="kicker text-[10px] text-muted">ECOSYSTEM ARCHITECTURE</span>
            <h3 className="text-sm font-semibold text-ink">LordOfSportz Direct Operations</h3>
            <p className="text-xs leading-relaxed text-muted">
              To guarantee zero counterfeit equipment and pristine quality standards, all products and orders
              are currently handled exclusively by LordOfSportz headquarters.
            </p>
            <div className="mt-2 rounded-xl bg-canvas p-3 text-[11px] text-muted border border-line/60">
              <span className="font-semibold text-brand-900">Notice:</span> Public merchant/shopkeeper
              registration is closed in this phase to maintain quality standards.
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {CATEGORIES.map((cat) => (
            <div key={cat.sport} className="rounded-2xl bg-surface p-5 ring-1 ring-line">
              <h4 className="text-sm font-semibold text-ink">{cat.sport}</h4>
              <ul className="mt-3 flex flex-col gap-1.5">
                {cat.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted">
                    <span className="size-1 rounded-full bg-brand-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 hover:underline"
          >
            Explore the LordOfSportz Shop Catalog →
          </Link>
        </div>
      </div>
    </section>
  );
}
