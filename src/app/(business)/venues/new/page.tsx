import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireBusiness } from "@/features/org/context";
import { sportChoices } from "@/features/venue/catalog";
import { VenueCreateForm } from "@/features/venue/VenueForms";

export const metadata: Metadata = { title: "Add venue" };

export default async function NewVenuePage() {
  const { org, capabilities, manager } = await requireBusiness();
  if (!capabilities.includes("VENUE_OPERATOR") || !manager) redirect("/venues");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Add a venue</h1>
      <VenueCreateForm orgId={org.id} sports={await sportChoices(org.sports)} />
    </div>
  );
}
