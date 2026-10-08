"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";
import type { LoginResult, TokenPair } from "@/lib/auth/cookies";
import { safeNextPath } from "@/lib/auth/jwt";
import {
  clearChallenge,
  clearSession,
  getChallenge,
  getRefreshToken,
  getSession,
  storeChallenge,
  storeSession,
} from "@/lib/auth/session";

/** Result shape consumed by the forms through useActionState. */
export interface FormState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  /** Submitted non-secret values, so the form keeps them after an error (React resets forms after actions). */
  values?: Record<string, string>;
}

function keep(form: FormData, ...names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((n) => [n, form.get(n)?.toString() ?? ""]));
}

const email = z.email("Enter a valid email address.").max(254);
const password = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(128)
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

function fieldErrors(error: z.ZodError): FormState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return { fieldErrors: errors };
}

function failure(error: unknown): FormState {
  if (error instanceof GatewayError) {
    const fields = error.body.details?.fields as Record<string, string> | undefined;
    return { error: error.body.message, fieldErrors: fields };
  }
  console.error("auth action failed unexpectedly", error); // server log only; the user sees a generic message
  return { error: "Something went wrong. Please try again." };
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const values = keep(form, "email");
  const parsed = z
    .object({ email, password: z.string().min(1, "Enter your password.").max(128) })
    .safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { ...fieldErrors(parsed.error), values };
  const next = safeNextPath(form.get("next")?.toString(), "/workspace");
  let challenged = false;
  try {
    const { data } = await gatewayFetch<LoginResult>("/auth/login", { method: "POST", body: parsed.data });
    if (data.tokens) {
      await storeSession(data.tokens);
    } else if (data.challenge) {
      // the password was right; this account also asks for a code from its authenticator app
      challenged = true;
      await storeChallenge(data.challenge.challengeToken, data.challenge.expiresAt);
    } else {
      return { error: "Sign-in did not complete. Please try again.", values };
    }
  } catch (error) {
    return { ...failure(error), values };
  }
  if (challenged) {
    redirect(`/login/code?next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

/** The second step of signing in: a code from the authenticator app, or a recovery code. */
export async function verifyMfaAction(_: FormState, form: FormData): Promise<FormState> {
  const challengeToken = await getChallenge();
  if (!challengeToken) return { error: "That took too long. Please sign in again." };
  const parsed = z
    .object({ code: z.string().trim().min(6, "Enter the six-digit code.").max(20) })
    .safeParse({ code: form.get("code") });
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    const { data } = await gatewayFetch<TokenPair>("/auth/mfa/verify", {
      method: "POST",
      body: { challengeToken, code: parsed.data.code },
    });
    await storeSession(data);
    await clearChallenge();
  } catch (error) {
    return failure(error);
  }
  redirect(safeNextPath(form.get("next")?.toString()));
}

/** Starts again from the password, e.g. when the challenge has expired. */
export async function abandonChallengeAction(): Promise<void> {
  await clearChallenge();
  redirect("/login");
}

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  const values = keep(form, "fullName", "email", "phone");
  const parsed = z
    .object({
      fullName: z.string().trim().min(2, "Enter your full name.").max(120),
      email,
      phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9 ]{7,20}$/, "Enter a valid phone number.")
        .optional()
        .or(z.literal("").transform(() => undefined)),
      password,
    })
    .safeParse({
      fullName: form.get("fullName"),
      email: form.get("email"),
      phone: form.get("phone") ?? "",
      password: form.get("password"),
    });
  if (!parsed.success) return { ...fieldErrors(parsed.error), values };
  try {
    const { data } = await gatewayFetch<TokenPair>("/auth/register", { method: "POST", body: parsed.data });
    await storeSession(data);
  } catch (error) {
    return { ...failure(error), values };
  }
  redirect(safeNextPath(form.get("next")?.toString(), "/onboarding/business"));
}

export async function logoutAction(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await gatewayFetch<void>("/auth/logout", { method: "POST", body: { refreshToken } }).catch(
      () => undefined,
    );
  }
  await clearSession();
  redirect("/");
}

export async function forgotPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const values = keep(form, "email");
  const parsed = z.object({ email }).safeParse({ email: form.get("email") });
  if (!parsed.success) return { ...fieldErrors(parsed.error), values };
  try {
    await gatewayFetch<void>("/auth/password/forgot", { method: "POST", body: parsed.data });
  } catch (error) {
    return { ...failure(error), values };
  }
  return { success: "If an account exists for that email, we have sent a reset link." };
}

export async function resetPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ token: z.string().min(1).max(128), newPassword: password })
    .safeParse({ token: form.get("token"), newPassword: form.get("newPassword") });
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await gatewayFetch<void>("/auth/password/reset", { method: "POST", body: parsed.data });
  } catch (error) {
    return failure(error);
  }
  return { success: "Your password has been reset. You can now sign in." };
}

export async function verifyEmailAction(_: FormState, form: FormData): Promise<FormState> {
  const token = form.get("token")?.toString() ?? "";
  if (!token || token.length > 128) return { error: "This verification link is incomplete." };
  try {
    await gatewayFetch<void>("/auth/email/verify", { method: "POST", body: { token } });
    return { success: "Your email address is verified." };
  } catch (error) {
    return failure(error);
  }
}

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function changePasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const session = await requireSession();
  const parsed = z
    .object({
      currentPassword: z.string().min(1, "Enter your current password.").max(128),
      newPassword: password,
    })
    .safeParse({ currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword") });
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await gatewayFetch<void>("/auth/password/change", {
      method: "POST",
      body: parsed.data,
      accessToken: session.accessToken,
    });
  } catch (error) {
    return failure(error);
  }
  // All sessions (including this one) were revoked by the server.
  await clearSession();
  redirect("/login?passwordChanged=1");
}

export async function revokeSessionAction(sessionId: string): Promise<void> {
  const session = await requireSession();
  if (!z.uuid().safeParse(sessionId).success) return;
  await gatewayFetch<void>(`/auth/sessions/${sessionId}`, {
    method: "DELETE",
    accessToken: session.accessToken,
  });
  revalidatePath("/account/security");
}

export async function logoutAllAction(): Promise<void> {
  const session = await requireSession();
  await gatewayFetch<void>("/auth/logout-all", { method: "POST", accessToken: session.accessToken });
  await clearSession();
  redirect("/login");
}

export async function resendVerificationAction(): Promise<FormState> {
  const session = await requireSession();
  try {
    await gatewayFetch<void>("/auth/email/verify/resend", {
      method: "POST",
      accessToken: session.accessToken,
    });
    return { success: "Verification email sent." };
  } catch (error) {
    return failure(error);
  }
}
