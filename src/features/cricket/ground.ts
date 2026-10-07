/**
 * Ground-board geometry, the same as the cricket service's ShotZones: the ground is a unit circle centred on the
 * pitch, seen from behind the batter (x to the right, y down, the bowler's end up). For a right-hander the right
 * half is the off side; a left-hander is mirrored. The service works out the zone itself; this copy only previews it.
 */
export const BATTER_Y = 0.1;
export const RING = 0.6;

export type Zone =
  | "STRAIGHT"
  | "MID_OFF"
  | "COVER"
  | "POINT"
  | "THIRD_MAN"
  | "MID_ON"
  | "MID_WICKET"
  | "SQUARE_LEG"
  | "FINE_LEG";

export const ZONE_LABEL: Record<Zone, string> = {
  STRAIGHT: "Straight",
  MID_OFF: "Mid-off",
  COVER: "Cover",
  POINT: "Point",
  THIRD_MAN: "Third man",
  MID_ON: "Mid-on",
  MID_WICKET: "Mid-wicket",
  SQUARE_LEG: "Square leg",
  FINE_LEG: "Fine leg",
};

export function classify(x: number, y: number, leftHanded: boolean): { zone: Zone; deep: boolean } | null {
  if (Math.hypot(x, y) > 1.05) return null;
  const dx = leftHanded ? -x : x;
  const dy = BATTER_Y - y;
  if (Math.hypot(dx, dy) < 0.02) return null;
  const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
  const a = Math.abs(angle);
  let zone: Zone;
  if (a <= 12) zone = "STRAIGHT";
  else if (angle > 0) zone = a <= 40 ? "MID_OFF" : a <= 70 ? "COVER" : a <= 110 ? "POINT" : "THIRD_MAN";
  else zone = a <= 40 ? "MID_ON" : a <= 75 ? "MID_WICKET" : a <= 110 ? "SQUARE_LEG" : "FINE_LEG";
  return { zone, deep: Math.hypot(x, y) > RING };
}
