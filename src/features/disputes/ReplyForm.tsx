"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import { disputeReplyAction } from "./actions";

export function DisputeReplyForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(disputeReplyAction, {} as ActionResult);
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <label className="flex flex-col gap-1 text-sm font-medium">
        Your reply
        <textarea
          name="body"
          rows={3}
          required
          maxLength={2000}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal"
        />
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          Send
        </Button>
        {state.error && (
          <span role="alert" className="text-sm text-danger">
            {state.error}
          </span>
        )}
        {state.success && (
          <span role="status" className="text-sm text-brand-700">
            {state.success}
          </span>
        )}
      </div>
    </form>
  );
}
