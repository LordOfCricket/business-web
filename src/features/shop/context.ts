import "server-only";
import { redirect } from "next/navigation";
import { type BusinessContext, requireBusiness } from "@/features/org/context";
import { getSellerProfile, type SellerProfile } from "./api";

/** Shop pages need the approved SELLER capability and a seller profile (else: back to shop setup). */
export async function requireSeller(): Promise<BusinessContext & { seller: SellerProfile }> {
  const context = await requireBusiness();
  if (!context.capabilities.includes("SELLER")) redirect("/shop");
  const seller = await getSellerProfile(context.org.id, context.session.accessToken);
  if (!seller) redirect("/shop");
  return { ...context, seller };
}
