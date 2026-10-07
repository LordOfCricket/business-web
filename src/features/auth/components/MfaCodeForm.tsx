"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Input } from "@/components/ui";
import { abandonChallengeAction, type FormState, verifyMfaAction } from "../actions";

const initial: FormState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      Sign in
    </Button>
  );
}

/** The second step of signing in for an account with an authenticator app. */
export function MfaCodeForm({ next }: { next: string }) {
  const [state, action] = useActionState(verifyMfaAction, initial);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <Input
        label="Code"
        name="code"
        // one-time-code lets a phone offer the code from its keyboard; a recovery code goes in the same box
        autoComplete="one-time-code"
        inputMode="text"
        autoFocus
        required
        placeholder="123456"
        error={state.fieldErrors?.code}
      />
      <Submit />
      <div className="flex justify-between text-sm">
        <span className="text-muted">Lost your phone? Use a recovery code.</span>
        <form action={abandonChallengeAction}>
          <button type="submit" className="text-brand-700 hover:underline">
            Start again
          </button>
        </form>
      </div>
    </form>
  );
}
