import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhatCanYouManageSection } from "@/components/landing/WhatCanYouManageSection";
import { BusinessTypesSection } from "@/components/landing/BusinessTypesSection";
import { SportsEcosystemSection } from "@/components/landing/SportsEcosystemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ShopMarketplaceSection } from "@/components/landing/ShopMarketplaceSection";
import { ForProfessionalsSection } from "@/components/landing/ForProfessionalsSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";

export const metadata: Metadata = {
  title: "LordOfSportz Business · Professional Operating Platform for Sports Organizations",
  description:
    "Manage sports academies, venues, pitches, coaches, staff, bookings, tournaments, and your official presence across the LordOfSportz sports ecosystem.",
};

export default function BusinessHomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. What Can You Manage? */}
      <WhatCanYouManageSection />

      {/* 3. Business Types (8 Interactive Cards) */}
      <BusinessTypesSection />

      {/* 4. Sports Ecosystem */}
      <SportsEcosystemSection />

      {/* 5. How It Works */}
      <HowItWorksSection />

      {/* 6. Deep Platform Features */}
      <FeaturesSection />

      {/* 7. Official LordOfSportz Shop */}
      <ShopMarketplaceSection />

      {/* 8. Built for Sports Professionals */}
      <ForProfessionalsSection />

      {/* 9. Final Call to Action */}
      <FinalCtaSection />
    </div>
  );
}
