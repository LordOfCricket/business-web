import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getUnreadCount } from "./api";

/** Header bell with the unread count (server component; renders nothing for guests). */
export async function NotificationBell() {
  const session = await getSession();
  if (!session) return null;
  const unread = await getUnreadCount(session.accessToken);
  const label = unread > 0 ? `Notifications, ${unread} unread` : "Notifications";
  return (
    <Link
      href="/notifications"
      aria-label={label}
      className="relative inline-flex size-9 items-center justify-center rounded-lg hover:bg-canvas"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
        <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-5 rounded-full bg-danger px-1 text-center text-xs font-semibold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
