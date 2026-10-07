import type { Metadata } from "next";
import { ErrorState } from "@/components/ui";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false },
  referrer: "no-referrer",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <ErrorState
        title="This verification link is incomplete"
        message="Open the link from your email again."
      />
    );
  }
  return (
    <AuthCard title="Verify your email" subtitle="Confirm this is your email address.">
      <VerifyEmailForm token={token} />
    </AuthCard>
  );
}
