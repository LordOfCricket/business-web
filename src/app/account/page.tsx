import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { ResendVerificationButton } from "@/features/auth/components/SessionControls";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

interface Me {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  roles: string[];
  emailVerified: boolean;
}

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  const { data: me } = await gatewayFetch<Me>("/auth/me", { accessToken: session.accessToken });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">My account</h1>
      <Card className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-semibold">{me.fullName}</p>
          {me.roles.map((role) => (
            <Badge key={role}>{role}</Badge>
          ))}
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted">Email</dt>
          <dd className="flex items-center gap-2">
            {me.email}
            <Badge tone={me.emailVerified ? "success" : "warning"}>
              {me.emailVerified ? "Verified" : "Not verified"}
            </Badge>
          </dd>
          {me.phone && (
            <>
              <dt className="text-muted">Phone</dt>
              <dd>{me.phone}</dd>
            </>
          )}
        </dl>
        {!me.emailVerified && <ResendVerificationButton />}
      </Card>
      <nav aria-label="Account" className="flex gap-4 text-sm font-medium">
        <Link href="/account/security" className="text-brand-700 hover:underline">
          Security &amp; sessions
        </Link>
        <Link href="/account/notifications" className="text-brand-700 hover:underline">
          Notification preferences
        </Link>
      </nav>
    </div>
  );
}
