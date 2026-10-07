import Link from "next/link";
import { UserIcon } from "@/components/shared/Icons";
import { logoutAction } from "@/features/auth/actions";
import { getSession } from "@/lib/auth/session";

/** Server component: Sign in for guests; the account and Sign out (POST, CSRF-safe) otherwise. */
export async function UserMenu({ accountHref = "/account" }: { accountHref?: string }) {
  const session = await getSession();
  if (!session) {
    return (
      <Link
        href="/login"
        className="hidden h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-brand-900 sm:inline-flex"
      >
        Sign in
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-1 text-sm">
      <Link
        href={accountHref}
        className="inline-flex h-10 items-center gap-2 rounded-full px-2 text-ink hover:bg-ink/5 sm:px-3"
      >
        <UserIcon aria-hidden="true" className="size-5 shrink-0" />
        <span className="sr-only sm:not-sr-only sm:max-w-40 sm:truncate">
          {session.user.email ?? "My account"}
        </span>
      </Link>
      <form action={logoutAction} className="hidden sm:block">
        <button
          type="submit"
          className="rounded-full px-3 py-2 whitespace-nowrap text-muted hover:bg-ink/5 hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
