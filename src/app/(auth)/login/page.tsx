import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/AuthForms";
import { safeNextPath } from "@/lib/auth/jwt";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; passwordChanged?: string }>;
}) {
  const { next, passwordChanged } = await searchParams;
  const destination = safeNextPath(next, "/workspace");
  if (await getSession()) redirect(destination);
  return (
    <AuthCard
      title="Sign in"
      subtitle={
        passwordChanged ? "Password changed — please sign in again." : "Welcome back to LordOfSportz."
      }
    >
      <LoginForm next={destination} />
    </AuthCard>
  );
}
