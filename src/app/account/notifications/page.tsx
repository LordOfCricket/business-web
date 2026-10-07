import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { getPreferences } from "@/features/notifications/api";
import { PreferencesForm } from "@/features/notifications/PreferencesForm";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Notification preferences" };
export const dynamic = "force-dynamic";

export default async function NotificationPreferencesPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/notifications");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-3xl leading-tight sm:text-4xl">Notification preferences</h1>
      <Card>
        <PreferencesForm initial={await getPreferences(session.accessToken)} />
      </Card>
    </div>
  );
}
