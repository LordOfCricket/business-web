"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui";
import { logoutAllAction, resendVerificationAction, revokeSessionAction, type FormState } from "../actions";

export function RevokeSessionButton({ sessionId }: { sessionId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      loading={pending}
      onClick={() => start(() => revokeSessionAction(sessionId))}
    >
      Sign out
    </Button>
  );
}

export function LogoutAllButton() {
  const [pending, start] = useTransition();
  return (
    <Button variant="danger" loading={pending} onClick={() => start(() => logoutAllAction())}>
      Sign out of all devices
    </Button>
  );
}

export function ResendVerificationButton() {
  const [state, action, pending] = useActionState<FormState>(resendVerificationAction, {});
  return (
    <form action={action} className="flex items-center gap-3">
      <Button type="submit" variant="secondary" size="sm" loading={pending}>
        Resend verification email
      </Button>
      {state.success && <span className="text-sm text-brand-700">{state.success}</span>}
      {state.error && <span className="text-sm text-danger">{state.error}</span>}
    </form>
  );
}
