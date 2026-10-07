"use client";

import { type KeyboardEvent, type PointerEvent, useRef } from "react";
import { BATTER_Y, classify, RING, ZONE_LABEL } from "./ground";

export interface Shot {
  x: number;
  y: number;
}

const R = 100; // SVG units per ground radius

/**
 * The scorer's ground board: tap where the ball went. The drawing is seen from behind the batter (bowler's end at
 * the top); off and leg side follow the striker's handedness. Keyboard: arrow keys move the marker, Delete clears it.
 */
export function GroundBoard({
  value,
  onChange,
  leftHanded,
  disabled,
}: {
  value: Shot | null;
  onChange: (shot: Shot | null) => void;
  leftHanded: boolean;
  disabled?: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const preview = value ? classify(value.x, value.y, leftHanded) : null;

  const place = (e: PointerEvent<SVGSVGElement>) => {
    if (disabled || !svg.current) return;
    const box = svg.current.getBoundingClientRect();
    // the view box is 240 wide around a 200-wide ground; convert to ground units (-1..1)
    const x = ((e.clientX - box.left) / box.width) * 2.4 - 1.2;
    const y = ((e.clientY - box.top) / box.height) * 2.4 - 1.2;
    const r = Math.hypot(x, y);
    // a tap just past the rope counts as the boundary
    const k = r > 1 ? 1 / r : 1;
    onChange({ x: round(x * k), y: round(y * k) });
  };

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (disabled) return;
    const step = 0.05;
    const cur = value ?? { x: 0, y: -0.5 };
    const moves: Record<string, [number, number]> = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
    };
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onChange(null);
    } else if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key]!;
      const x = cur.x + dx;
      const y = cur.y + dy;
      const r = Math.hypot(x, y);
      onChange(r > 1 ? { x: round(x / r), y: round(y / r) } : { x: round(x), y: round(y) });
    }
  };

  const offOnRight = !leftHanded;
  return (
    <div className="flex flex-col gap-2">
      <svg
        ref={svg}
        viewBox="-120 -120 240 240"
        role="application"
        aria-label="Ground board: tap where the ball went. Arrow keys move the marker, Delete clears it."
        tabIndex={disabled ? -1 : 0}
        onPointerDown={place}
        onKeyDown={onKey}
        className={`mx-auto aspect-square w-full max-w-sm touch-none rounded-full outline-offset-4 select-none focus-visible:outline-2 focus-visible:outline-brand-600 ${
          disabled ? "cursor-not-allowed opacity-40" : "cursor-crosshair"
        }`}
      >
        <circle r={R + 6} fill="#1f5135" />
        <circle r={R} fill="#2d6043" stroke="#f5f2ea" strokeWidth="1.5" />
        <circle r={R * RING} fill="none" stroke="#f5f2ea" strokeOpacity="0.55" strokeDasharray="3 4" />
        {/* the pitch, bowler's end up */}
        <rect x={-4} y={-R * 0.14} width={8} height={R * 0.28} rx={1} fill="#d8c79a" />
        <circle cy={R * BATTER_Y} r={2.4} fill="#1a1c19" />
        <text x={0} y={-R - 10} textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">
          Bowler&apos;s end
        </text>
        <text x={-R + 8} y={4} fontSize="9" fill="#f5f2ea" opacity="0.8">
          {offOnRight ? "LEG" : "OFF"}
        </text>
        <text x={R - 8} y={4} fontSize="9" textAnchor="end" fill="#f5f2ea" opacity="0.8">
          {offOnRight ? "OFF" : "LEG"}
        </text>
        {value && (
          <g pointerEvents="none">
            <line
              x1={0}
              y1={R * BATTER_Y}
              x2={value.x * R}
              y2={value.y * R}
              stroke="#f5f2ea"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx={value.x * R}
              cy={value.y * R}
              r={5}
              fill="#b35d3a"
              stroke="#f5f2ea"
              strokeWidth="1.5"
            />
          </g>
        )}
      </svg>
      <p className="text-center text-sm" aria-live="polite">
        {disabled
          ? "No shot for a wide, bye or leg bye"
          : preview
            ? `${ZONE_LABEL[preview.zone]} · ${preview.deep ? "deep" : "in the ring"}`
            : "Optional: tap where the ball went"}
        {value && !disabled && (
          <button type="button" onClick={() => onChange(null)} className="ml-3 text-brand-700 underline">
            Clear
          </button>
        )}
      </p>
    </div>
  );
}

const round = (n: number) => Math.round(n * 1000) / 1000;
