import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { ChangePasswordForm } from "@/features/auth/components/AuthForms";
import { LogoutAllButton, RevokeSessionButton } from "@/features/auth/components/SessionControls";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Security", robots: { index: false } };

interface SessionView {
  id: string;
  lastActiveAt: string;
  expiresAt: string;
  userAgent?: string;
  ipAddress?: string;
}

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default async function SecurityPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/security");
  const { data: sessions } = await gatewayFetch<SessionView[]>("/auth/sessions", {
    accessToken: session.accessToken,
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Security</h1>

      <section aria-labelledby="password-title" className="flex flex-col gap-3">
        <h2 id="password-title" className="display text-2xl">
          Password
        </h2>
        <Card>
          <ChangePasswordForm />
        </Card>
      </section>

      <section aria-labelledby="sessions-title" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="sessions-title" className="display text-2xl">
            Signed-in devices
          </h2>
          <LogoutAllButton />
        </div>
        <ul className="flex flex-col gap-3">
          {sessions.map((s) => (
            <li key={s.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col text-sm">
                  <span className="font-medium">{s.userAgent ?? "Unknown device"}</span>
                  <span className="text-muted">
                    Last active {dateFormat.format(new Date(s.lastActiveAt))}
                    {s.ipAddress ? ` · ${s.ipAddress}` : ""}
                  </span>
                </div>
                <RevokeSessionButton sessionId={s.id} />
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
