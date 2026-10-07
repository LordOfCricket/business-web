import "server-only";
import { gatewayFetch } from "@/lib/api/gateway";
import type { PageMeta } from "@/types/api";

export interface InboxItem {
  id: string;
  category: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  createdAt: string;
  read: boolean;
}

export interface Preference {
  category: string;
  email: boolean;
  inApp: boolean;
}

export async function getInbox(token: string, page = 0): Promise<{ items: InboxItem[]; meta?: PageMeta }> {
  const { data, meta } = await gatewayFetch<InboxItem[]>(`/notifications?page=${page}&size=20`, {
    accessToken: token,
  });
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function getAnnouncements(token: string): Promise<InboxItem[]> {
  return (await gatewayFetch<InboxItem[]>("/notifications/announcements", { accessToken: token })).data;
}

/** Unread count for the header bell; never breaks the page if notifications are unavailable. */
export async function getUnreadCount(token: string): Promise<number> {
  try {
    return (
      await gatewayFetch<{ unread: number }>("/notifications/unread-count", {
        accessToken: token,
        timeoutMs: 2_000,
      })
    ).data.unread;
  } catch {
    return 0;
  }
}

export async function getPreferences(token: string): Promise<Preference[]> {
  return (await gatewayFetch<Preference[]>("/notifications/preferences", { accessToken: token })).data;
}
