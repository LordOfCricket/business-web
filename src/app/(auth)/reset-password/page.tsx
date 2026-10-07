import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ResetPasswordForm } from "@/features/auth/components/AuthForms";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false },
  referrer: "no-referrer", // the token is in the URL; never leak it to other sites
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <EmptyState
        title="This reset link is incomplete"
        action={
          <Link href="/forgot-password" className="text-sm font-medium text-brand-700 underline">
            Request a new link
          </Link>
        }
      />
    );
  }
  return (
    <AuthCard title="Choose a new password">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
