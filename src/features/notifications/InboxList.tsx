"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils/cn";
import { markReadAction } from "./actions";
import type { InboxItem } from "./api";

const CATEGORY_LABEL: Record<string, string> = {
  PAYMENTS: "Payment",
  BOOKINGS: "Booking",
  ORDERS: "Order",
  TOURNAMENTS: "Tournament",
  BUSINESS: "Business",
  ANNOUNCEMENTS: "Announcement",
  ACCOUNT: "Account",
};

/** Inbox items; opening one marks it read and follows its link (links may point to another LordOfSportz site). */
export function InboxList({ items }: { items: InboxItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function open(item: InboxItem) {
    start(async () => {
      if (!item.read) await markReadAction(item.id);
      if (!item.link) return router.refresh();
      if (item.link.startsWith("/")) router.push(item.link);
      else window.location.assign(item.link);
    });
  }

  return (
    <ul
      className="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface"
      aria-busy={pending}
    >
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => open(item)}
            className={cn(
              "flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-canvas",
              !item.read && "bg-brand-50/40",
            )}
          >
            <span className="flex items-center gap-2 text-xs text-muted">
              {!item.read && <span aria-label="Unread" className="size-2 rounded-full bg-brand-600" />}
              {CATEGORY_LABEL[item.category] ?? item.category} ·{" "}
              {new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </span>
            <span className={cn("text-sm", !item.read && "font-semibold")}>{item.title}</span>
            <span className="text-sm text-muted">{item.body}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
