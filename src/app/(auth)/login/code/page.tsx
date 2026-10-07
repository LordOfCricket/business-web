import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { MfaCodeForm } from "@/features/auth/components/MfaCodeForm";
import { safeNextPath } from "@/lib/auth/jwt";
import { getChallenge } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Enter your code", robots: { index: false } };

export default async function MfaCodePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  // Reaching this page without a challenge means the password step was skipped or has expired.
  if (!(await getChallenge())) redirect("/login");
  const { next } = await searchParams;
  return (
    <AuthCard
      title="Enter your code"
      subtitle="Open your authenticator app and type the six-digit code for LordOfSportz. A recovery code works too."
    >
      <MfaCodeForm next={safeNextPath(next)} />
    </AuthCard>
  );
}
