"use client";

import { useId, useState } from "react";
import { completeUploadAction, requestUploadAction, type UploadedMedia } from "./actions";

const ACCEPT: Record<string, string> = {
  AVATAR: "image/jpeg,image/png,image/webp",
  PROFESSIONAL_IMAGE: "image/jpeg,image/png,image/webp",
  CERTIFICATE: "application/pdf,image/jpeg,image/png",
  ORG_DOCUMENT: "application/pdf,image/jpeg,image/png",
  VENUE_IMAGE: "image/jpeg,image/png,image/webp",
  FACILITY_IMAGE: "image/jpeg,image/png,image/webp",
  PRODUCT_IMAGE: "image/jpeg,image/png,image/webp",
  VENUE_VIDEO: "video/mp4,video/webm",
  SPORT_ICON: "image/jpeg,image/png,image/webp",
};

/**
 * Direct-to-storage upload: (1) signed URL from the media service, (2) the browser PUTs the file to storage,
 * (3) the media service verifies it. Calls `onUploaded` with the verified media id.
 */
export function FileUpload({
  label,
  purpose,
  onUploaded,
}: {
  label: string;
  purpose: keyof typeof ACCEPT;
  onUploaded: (media: UploadedMedia) => void;
}) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "done">("idle");
  const [message, setMessage] = useState<string>();

  async function upload(file: File) {
    setStatus("uploading");
    setMessage(undefined);
    const ticket = await requestUploadAction({ purpose, contentType: file.type, sizeBytes: file.size });
    if (!ticket.ok) return fail(ticket.error);
    const put = await fetch(ticket.value.uploadUrl, {
      method: "PUT",
      headers: ticket.value.headers,
      body: file,
    }).catch(() => null);
    if (!put?.ok) return fail("Upload failed. Please try again.");
    const done = await completeUploadAction(ticket.value.mediaId);
    if (!done.ok) return fail(done.error);
    setStatus("done");
    onUploaded(done.value);
  }

  function fail(error: string) {
    setStatus("error");
    setMessage(error);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={ACCEPT[purpose]}
        disabled={status === "uploading"}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
        className="text-sm file:mr-3 file:rounded-lg file:border file:border-line file:bg-surface file:px-3 file:py-1.5"
      />
      {status === "uploading" && (
        <p role="status" className="text-sm text-muted">
          Uploading…
        </p>
      )}
      {status === "done" && (
        <p role="status" className="text-sm text-brand-700">
          Uploaded.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      )}
    </div>
  );
}
