"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import { savePreferencesAction } from "./actions";
import type { Preference } from "./api";

const LABELS: Record<string, { title: string; hint: string }> = {
  BOOKINGS: { title: "Bookings", hint: "Confirmations, reminders, cancellations" },
  PAYMENTS: { title: "Payments", hint: "Receipts, failed payments, refunds" },
  ORDERS: { title: "Shop orders", hint: "Order updates, shipping, returns" },
  TOURNAMENTS: { title: "Tournaments & gradings", hint: "Entries, fixtures, results and belt promotions" },
  BUSINESS: { title: "Business", hint: "Verification and venue approvals (business accounts)" },
  ANNOUNCEMENTS: { title: "Announcements", hint: "News from LordOfSportz (in-app only)" },
};

/** Per-category email / in-app choices. Security emails (password, sign-in) are always sent. */
export function PreferencesForm({ initial }: { initial: Preference[] }) {
  const [prefs, setPrefs] = useState(initial);
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  const toggle = (category: string, key: "email" | "inApp") =>
    setPrefs((all) => all.map((p) => (p.category === category ? { ...p, [key]: !p[key] } : p)));

  return (
    <div className="flex flex-col gap-4">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Notification preferences</caption>
        <thead className="text-muted">
          <tr>
            <th scope="col" className="py-2 font-medium">
              Category
            </th>
            <th scope="col" className="py-2 font-medium">
              Email
            </th>
            <th scope="col" className="py-2 font-medium">
              In the app
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {prefs.map((p) => (
            <tr key={p.category}>
              <th scope="row" className="py-3 font-normal">
                <span className="font-medium">{LABELS[p.category]?.title ?? p.category}</span>
                <span className="block text-muted">{LABELS[p.category]?.hint}</span>
              </th>
              <td>
                <input
                  type="checkbox"
                  aria-label={`${LABELS[p.category]?.title} by email`}
                  checked={p.email}
                  disabled={p.category === "ANNOUNCEMENTS"}
                  onChange={() => toggle(p.category, "email")}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  aria-label={`${LABELS[p.category]?.title} in the app`}
                  checked={p.inApp}
                  onChange={() => toggle(p.category, "inApp")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-muted">Security emails such as password changes are always sent.</p>
      <div className="flex items-center gap-3">
        <Button
          loading={pending}
          onClick={() => start(async () => setResult(await savePreferencesAction(prefs)))}
        >
          Save preferences
        </Button>
        {result.error && (
          <span role="alert" className="text-sm text-danger">
            {result.error}
          </span>
        )}
        {result.success && (
          <span role="status" className="text-sm text-brand-700">
            {result.success}
          </span>
        )}
      </div>
    </div>
  );
}
