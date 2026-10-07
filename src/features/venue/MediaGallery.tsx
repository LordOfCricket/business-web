"use client";

import Image from "next/image";
import { Button } from "@/components/ui";
import { FileUpload } from "@/features/media/FileUpload";

export interface GalleryItem {
  mediaId: string;
  kind: string;
  url?: string;
}

/** Photos (and videos for venues). The first image is the cover on listings. */
export function MediaGallery({
  items,
  onChange,
  allowVideo,
  purpose,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  allowVideo: boolean;
  /** Upload purpose of the photos; defaults to venue / facility images. */
  purpose?: "VENUE_IMAGE" | "FACILITY_IMAGE" | "PRODUCT_IMAGE";
}) {
  const move = (i: number, delta: number) => {
    const next = [...items];
    const [item] = next.splice(i, 1);
    if (!item) return;
    next.splice(i + delta, 0, item);
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-muted">No photos yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-3">
          {items.map((item, i) => (
            <li key={item.mediaId} className="flex flex-col gap-2 rounded-lg border border-line p-2">
              {item.kind === "VIDEO" ? (
                <video src={item.url} className="aspect-video w-full rounded object-cover" muted />
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded bg-canvas">
                  {item.url && (
                    <Image
                      src={item.url}
                      alt={`Photo ${i + 1}`}
                      fill
                      sizes="240px"
                      unoptimized
                      className="object-cover"
                    />
                  )}
                </div>
              )}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  aria-label="Move earlier"
                >
                  ←
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label="Move later"
                >
                  →
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <FileUpload
          label="Add a photo"
          purpose={purpose ?? (allowVideo ? "VENUE_IMAGE" : "FACILITY_IMAGE")}
          onUploaded={(m) => onChange([...items, { mediaId: m.id, kind: m.kind, url: m.url }])}
        />
        {allowVideo && (
          <FileUpload
            label="Add a video"
            purpose="VENUE_VIDEO"
            onUploaded={(m) => onChange([...items, { mediaId: m.id, kind: m.kind, url: m.url }])}
          />
        )}
      </div>
    </div>
  );
}
