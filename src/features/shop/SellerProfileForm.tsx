"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditorSection, textareaClass } from "@/components/common/EditorSection";
import { Input } from "@/components/ui";
import { saveSellerProfileAction, type SellerProfileInput } from "./actions";
import type { SellerProfile } from "./api";

/** Seller onboarding and settings (spec §13 "Seller onboarding"): shop name, pickup, delivery and returns. */
export function SellerProfileForm({
  orgId,
  profile,
  defaults,
}: {
  orgId: string;
  profile: SellerProfile | null;
  defaults: { displayName: string; email: string; city: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState<SellerProfileInput>({
    displayName: profile?.displayName ?? defaults.displayName,
    supportEmail: profile?.supportEmail ?? defaults.email,
    supportPhone: profile?.supportPhone ?? "",
    pickupAddress: profile?.pickupAddress ?? "",
    city: profile?.city ?? defaults.city,
    gstin: profile?.gstin ?? "",
    returnPolicy: profile?.returnPolicy ?? "",
    returnWindowDays: profile?.returnWindowDays ?? 7,
    deliveryCharge: profile?.deliveryCharge ?? 49,
    freeDeliveryAbove: profile?.freeDeliveryAbove ?? 999,
    dispatchDays: profile?.dispatchDays ?? 2,
  });
  const set = (key: keyof SellerProfileInput) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <EditorSection
      title={profile ? "Shop settings" : "Set up your shop"}
      description={
        profile
          ? "Shown to customers on every product and used for delivery and returns."
          : "Tell customers who you are and how you deliver. You can change these later."
      }
      saveLabel={profile ? "Save" : "Start selling"}
      onSave={async () => {
        const result = await saveSellerProfileAction(orgId, form);
        if (!result.error) router.refresh();
        return result;
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Shop name" value={form.displayName} onChange={set("displayName")} maxLength={120} />
        <Input label="Support email" type="email" value={form.supportEmail} onChange={set("supportEmail")} />
        <Input label="Support phone" value={form.supportPhone ?? ""} onChange={set("supportPhone")} />
        <Input label="GSTIN (optional)" value={form.gstin ?? ""} onChange={set("gstin")} maxLength={15} />
        <Input label="Pickup address" value={form.pickupAddress} onChange={set("pickupAddress")} />
        <Input label="City" value={form.city} onChange={set("city")} />
        <Input
          label="Delivery charge (₹)"
          inputMode="decimal"
          value={String(form.deliveryCharge ?? "")}
          onChange={set("deliveryCharge")}
        />
        <Input
          label="Free delivery above (₹, optional)"
          inputMode="decimal"
          value={String(form.freeDeliveryAbove ?? "")}
          onChange={set("freeDeliveryAbove")}
        />
        <Input
          label="Dispatch within (days)"
          inputMode="numeric"
          value={String(form.dispatchDays)}
          onChange={set("dispatchDays")}
        />
        <Input
          label="Return window (days, 0 = no returns)"
          inputMode="numeric"
          value={String(form.returnWindowDays)}
          onChange={set("returnWindowDays")}
        />
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Return policy (optional)</span>
        <textarea
          className={textareaClass}
          value={form.returnPolicy ?? ""}
          onChange={set("returnPolicy")}
          maxLength={1000}
        />
      </label>
    </EditorSection>
  );
}
