import Image from "next/image";
import type { ReactNode } from "react";
import { type ArtKind, type SportEditorial } from "@/content/sports";
import { cn } from "@/lib/utils/cn";

/**
 * The markings of each sport's playing surface, drawn in fine lines: an aerial "poster" of the oval, pitch or court.
 * Pure SVG (no image requests), inherits `currentColor`, decorative only.
 */
const MARKINGS: Record<ArtKind, ReactNode> = {
  cricket: (
    <>
      <ellipse cx="240" cy="160" rx="214" ry="142" />
      <ellipse cx="240" cy="160" rx="118" ry="84" strokeDasharray="4 7" />
      <rect x="229" y="112" width="22" height="96" />
      <path d="M219 124h42M219 196h42M236 112v-6M240 112v-6M244 112v-6M236 208v6M240 208v6M244 208v6" />
    </>
  ),
  football: (
    <>
      <rect x="30" y="30" width="420" height="260" />
      <path d="M240 30v260" />
      <circle cx="240" cy="160" r="42" />
      <circle cx="240" cy="160" r="2" />
      <rect x="30" y="92" width="68" height="136" />
      <rect x="30" y="130" width="24" height="60" />
      <rect x="382" y="92" width="68" height="136" />
      <rect x="426" y="130" width="24" height="60" />
      <path d="M98 136a30 30 0 0 1 0 48M382 136a30 30 0 0 0 0 48" />
    </>
  ),
  tennis: (
    <>
      <rect x="40" y="50" width="400" height="220" />
      <path d="M40 78h400M40 242h400M240 38v244M132 78v164M348 78v164M132 160h216M40 160h8M432 160h8" />
    </>
  ),
  badminton: (
    <>
      <rect x="50" y="60" width="380" height="200" />
      <path d="M50 75h380M50 245h380M240 50v220M204 60v200M276 60v200M73 60v200M407 60v200M50 160h154M276 160h154" />
    </>
  ),
  basketball: (
    <>
      <rect x="30" y="40" width="420" height="240" />
      <path d="M240 40v240" />
      <circle cx="240" cy="160" r="32" />
      <rect x="30" y="126" width="92" height="68" />
      <rect x="358" y="126" width="92" height="68" />
      <circle cx="122" cy="160" r="30" />
      <circle cx="358" cy="160" r="30" />
      <path d="M30 56h44a132 132 0 0 1 0 208H30M450 56h-44a132 132 0 0 0 0 208h44" />
      <circle cx="46" cy="160" r="5" />
      <circle cx="434" cy="160" r="5" />
    </>
  ),
  karate: (
    <>
      <rect x="90" y="10" width="300" height="300" />
      <rect x="112" y="32" width="256" height="256" />
      <path
        d="M140 10v300M190 10v300M240 10v300M290 10v300M340 10v300M90 60h300M90 110h300M90 160h300M90 210h300M90 260h300"
        strokeOpacity="0.28"
        strokeDasharray="none"
      />
      <path d="M222 138v44M258 138v44M240 106v10" strokeWidth="3" />
    </>
  ),
  volleyball: (
    <>
      <rect x="60" y="70" width="360" height="180" />
      <path d="M240 56v208M180 70v180M300 70v180" />
    </>
  ),
  generic: (
    <>
      <rect x="40" y="40" width="400" height="240" rx="120" />
      <rect x="62" y="62" width="356" height="196" rx="98" />
      <rect x="84" y="84" width="312" height="152" rx="76" />
      <path d="M240 40v44M240 236v44" />
    </>
  ),
};

export function SportArt({
  kind,
  className,
  animated = false,
}: {
  kind: ArtKind;
  className?: string;
  /** Draw the lines in on first paint (disabled automatically for reduced motion). */
  animated?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 480 320"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={cn(animated && "draw-lines", className)}
    >
      {MARKINGS[kind]}
    </svg>
  );
}

/**
 * A sport's visual: its licensed photograph when one is configured, otherwise the line artwork on the sport's tone.
 * Fills its (relatively positioned) parent.
 */
export function SportVisual({
  editorial,
  sizes,
  priority = false,
  animated = false,
  className,
  artClassName,
}: {
  editorial: SportEditorial;
  sizes: string;
  priority?: boolean;
  animated?: boolean;
  className?: string;
  /** Replaces the artwork's default placement. */
  artClassName?: string;
}) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: editorial.tone.bg, color: editorial.tone.line }}
    >
      {editorial.image ? (
        <Image
          src={editorial.image.src}
          alt={editorial.image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <SportArt
          kind={editorial.art}
          animated={animated}
          className={artClassName ?? "absolute inset-0 size-full p-6 opacity-80"}
        />
      )}
    </div>
  );
}
