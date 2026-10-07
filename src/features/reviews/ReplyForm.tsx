"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionFeedback, textareaClass } from "@/components/common/EditorSection";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import { replyToReviewAction } from "./actions";

/** Write or edit the public reply to one review. */
export function ReplyForm({ reviewId, current }: { reviewId: string; current?: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(!current);
  const [text, setText] = useState(current ?? "");
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();

  if (!editing) {
    return (
      <Button size="sm" variant="secondary" className="self-start" onClick={() => setEditing(true)}>
        Edit reply
      </Button>
    );
  }
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await replyToReviewAction(reviewId, text);
          setResult(r);
          if (r.success) {
            setEditing(false);
            router.refresh();
          }
        });
      }}
    >
      <label htmlFor={`reply-${reviewId}`} className="text-sm font-medium">
        Public reply
      </label>
      <textarea
        id={`reply-${reviewId}`}
        rows={3}
        maxLength={1000}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={textareaClass}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" loading={pending} disabled={text.trim().length < 2}>
          {current ? "Update reply" : "Reply"}
        </Button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}
