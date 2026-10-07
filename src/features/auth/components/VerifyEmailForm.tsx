"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui";
import { type FormState, verifyEmailAction } from "../actions";

/** Verification needs an explicit click, so email link scanners that prefetch URLs cannot consume the token. */
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(verifyEmailAction, {});
  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
          {state.success}
        </p>
        <Link href="/" className="text-sm font-medium text-brand-700 hover:underline">
          Continue to LordOfSportz
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <input type="hidden" name="token" value={token} />
      <Button type="submit" loading={pending}>
        Verify my email
      </Button>
    </form>
  );
}
