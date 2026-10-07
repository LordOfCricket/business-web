import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, Pagination } from "@/components/ui";
import { markAllReadAction } from "@/features/notifications/actions";
import { getAnnouncements, getInbox } from "@/features/notifications/api";
import { InboxList } from "@/features/notifications/InboxList";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Notifications", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/notifications");
  const page = Math.max(0, Number.parseInt((await searchParams).page ?? "0", 10) || 0);
  const [inbox, announcements] = await Promise.all([
    getInbox(session.accessToken, page),
    page === 0 ? getAnnouncements(session.accessToken) : Promise.resolve([]),
  ]);
  const items = [...announcements.filter((a) => !a.read), ...inbox.items];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Notifications</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/account/notifications" className="font-medium text-brand-700 hover:underline">
            Preferences
          </Link>
          <form action={markAllReadAction}>
            <button
              type="submit"
              className="rounded-full border border-ink/15 px-3 py-1.5 hover:border-ink/40"
            >
              Mark all as read
            </button>
          </form>
        </div>
      </div>
      {items.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          description="Verification decisions, venue approvals and news appear here."
        />
      ) : (
        <InboxList items={items} />
      )}
      {inbox.meta && inbox.meta.totalPages > 1 && (
        <Pagination
          page={inbox.meta.page}
          totalPages={inbox.meta.totalPages}
          hrefFor={(p) => `/notifications?page=${p}`}
        />
      )}
    </div>
  );
}
