import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/AuthForms";
import { safeNextPath } from "@/lib/auth/jwt";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getSession()) redirect(safeNextPath(next));
  return (
    <AuthCard title="Create your account" subtitle="One account for every sport, booking and order.">
      <RegisterForm next={next ? safeNextPath(next) : undefined} />
    </AuthCard>
  );
}
