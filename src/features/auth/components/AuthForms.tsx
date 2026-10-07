"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Input } from "@/components/ui";
import {
  changePasswordAction,
  forgotPasswordAction,
  type FormState,
  loginAction,
  registerAction,
  resetPasswordAction,
} from "../actions";

const initial: FormState = {};

function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      {children}
    </Button>
  );
}

function FormMessage({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p role="status" className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
        {state.success}
      </p>
    );
  }
  return null;
}

export function LoginForm({ next, allowRegister = true }: { next?: string; allowRegister?: boolean }) {
  const [state, action] = useActionState(loginAction, initial);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next ?? "/"} />
      <Input
        label="Email"
        name="email"
        defaultValue={state.values?.email}
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <Submit>Sign in</Submit>
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-brand-700 hover:underline">
          Forgot password?
        </Link>
        {allowRegister && (
          <Link
            href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-brand-700 hover:underline"
          >
            Create an account
          </Link>
        )}
      </div>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState(registerAction, initial);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Input
        label="Full name"
        name="fullName"
        defaultValue={state.values?.fullName}
        autoComplete="name"
        required
        error={state.fieldErrors?.fullName}
      />
      <Input
        label="Email"
        name="email"
        defaultValue={state.values?.email}
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <Input
        label="Phone (optional)"
        name="phone"
        defaultValue={state.values?.phone}
        type="tel"
        autoComplete="tel"
        error={state.fieldErrors?.phone}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 10 characters with a letter and a number."
        required
        error={state.fieldErrors?.password}
      />
      <Submit>Create account</Submit>
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, initial);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <Input
        label="Email"
        name="email"
        defaultValue={state.values?.email}
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <Submit>Send reset link</Submit>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initial);
  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage state={state} />
        <Link href="/login" className="text-sm font-medium text-brand-700 hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <Input
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        hint="At least 10 characters with a letter and a number."
        required
        error={state.fieldErrors?.newPassword}
      />
      <Submit>Reset password</Submit>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initial);
  return (
    <form action={action} className="flex max-w-md flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <Input
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.currentPassword}
      />
      <Input
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        hint="Changing your password signs you out on every device."
        required
        error={state.fieldErrors?.newPassword}
      />
      <Submit>Change password</Submit>
    </form>
  );
}
