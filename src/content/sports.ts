/**
 * Editorial presentation of each sport: voice, colour, artwork and the words a sport uses for its places.
 *
 * The sport list itself always comes from the Sports catalog API (a sport the Super Admin adds appears without a code
 * change). This module only enriches a catalog sport with presentation; an unknown slug gets `genericSport()`, so a
 * new sport renders well from day one and can be given its own voice here later.
 */

export type ArtKind =
  "cricket" | "football" | "tennis" | "badminton" | "basketball" | "karate" | "volleyball" | "generic";

export interface SportLink {
  label: string;
  href: string;
  description: string;
}

export interface SportEditorial {
  /** Three short lines for the sport hero ("Follow the game. / Find your ground. / Play your match."). */
  heroLines: [string, string, string];
  /** One sentence for cards and the hero. */
  blurb: string;
  /** Background and line colour of the artwork panel. */
  tone: { bg: string; line: string; ink: string };
  art: ArtKind;
  /** What this sport calls a venue: grounds, courts, dojos… */
  venue: { singular: string; plural: string };
  /** Optional licensed photograph; the line artwork is used without one. */
  image?: { src: string; alt: string };
  /** Sport-specific destinations that exist on the platform. */
  links: (slug: string) => SportLink[];
}

const common = (slug: string): SportLink[] => [
  {
    label: "Tournaments",
    href: `/sports/${slug}/tournaments`,
    description: "Entries, fixtures, live scores and results.",
  },
];

const EDITORIAL: Record<string, SportEditorial> = {
  cricket: {
    heroLines: ["Follow the game.", "Find your ground.", "Play your match."],
    blurb: "Grounds and nets, ball-by-ball scorecards, local leagues and the gear that goes in the kit bag.",
    tone: { bg: "#2f4a34", line: "#e9e4d4", ink: "#f5f2ea" },
    art: "cricket",
    venue: { singular: "ground", plural: "grounds" },
    links: (slug) => [
      ...common(slug),
      { label: "My teams", href: "/account/teams", description: "Build a squad and enter tournaments." },
    ],
  },
  football: {
    heroLines: ["Book the pitch.", "Bring the squad.", "Chase the league."],
    blurb: "Turfs and pitches, five-a-side to full matches, league tables and match reports.",
    tone: { bg: "#1f3a33", line: "#dfe8df", ink: "#f5f2ea" },
    art: "football",
    venue: { singular: "pitch", plural: "pitches" },
    links: (slug) => [
      ...common(slug),
      { label: "My teams", href: "/account/teams", description: "Register your side and its players." },
    ],
  },
  tennis: {
    heroLines: ["Find a court.", "Hold your serve.", "Climb the rankings."],
    blurb: "Hard, clay and grass courts, coaches, draws and point-by-point scoreboards.",
    tone: { bg: "#a4583a", line: "#f6e8dc", ink: "#fff8f1" },
    art: "tennis",
    venue: { singular: "court", plural: "courts" },
    links: (slug) => [
      ...common(slug),
      {
        label: "Rankings",
        href: `/sports/${slug}/rankings`,
        description: "Singles rankings from the last 52 weeks.",
      },
      { label: "My tennis profile", href: "/account/tennis", description: "Your player card and entries." },
    ],
  },
  badminton: {
    heroLines: ["Book a court.", "Rally with friends.", "Enter the draw."],
    blurb: "Indoor courts by the hour, coaches and academies, draws and rally-by-rally scoring.",
    tone: { bg: "#2c4d5c", line: "#e1ecef", ink: "#f4f8f8" },
    art: "badminton",
    venue: { singular: "court", plural: "courts" },
    links: (slug) => [
      ...common(slug),
      {
        label: "Rankings",
        href: `/sports/${slug}/rankings`,
        description: "Rankings from the last 52 weeks.",
      },
      {
        label: "My badminton profile",
        href: "/account/badminton",
        description: "Your player card and entries.",
      },
    ],
  },
  karate: {
    heroLines: ["Train with purpose.", "Earn every belt.", "Step onto the tatami."],
    blurb: "Dojos and academies, senseis, belt gradings and kumite and kata competitions.",
    tone: { bg: "#2b3250", line: "#e6e3d6", ink: "#f5f2ea" },
    art: "karate",
    venue: { singular: "dojo", plural: "dojos" },
    links: (slug) => [
      ...common(slug),
      { label: "Belt system", href: `/sports/${slug}/belts`, description: "Kyu and dan grades, in order." },
      { label: "My karate profile", href: "/account/karate", description: "Your grade, club and entries." },
    ],
  },
  basketball: {
    heroLines: ["Find a court.", "Run the game.", "Own the paint."],
    blurb: "Indoor and outdoor courts, pick-up games, coaches and the gear to play in.",
    tone: { bg: "#9a6433", line: "#f5e9da", ink: "#fff8f0" },
    art: "basketball",
    venue: { singular: "court", plural: "courts" },
    links: common,
  },
  volleyball: {
    heroLines: ["Find a court.", "Set the play.", "Win the rally."],
    blurb: "Indoor and beach courts, clubs and coaches.",
    tone: { bg: "#3c5a73", line: "#e4edf3", ink: "#f5f8fa" },
    art: "volleyball",
    venue: { singular: "court", plural: "courts" },
    links: common,
  },
};

const GENERIC_TONES = [
  { bg: "#3d4a3e", line: "#e8e4d6", ink: "#f5f2ea" },
  { bg: "#4a3f35", line: "#efe6d8", ink: "#f8f3ea" },
  { bg: "#34434d", line: "#e2e9ec", ink: "#f4f7f8" },
];

function genericSport(slug: string): SportEditorial {
  const tone = GENERIC_TONES[[...slug].reduce((sum, c) => sum + c.charCodeAt(0), 0) % GENERIC_TONES.length]!;
  return {
    heroLines: ["Find a place to play.", "Meet your people.", "Get in the game."],
    blurb: "Places to play, coaches, academies and competitions near you.",
    tone,
    art: "generic",
    venue: { singular: "venue", plural: "venues" },
    links: common,
  };
}

export function sportEditorial(slug: string): SportEditorial {
  return EDITORIAL[slug] ?? genericSport(slug);
}

/**
 * Sports shown as "coming soon" on the homepage when the catalog does not list them yet. Purely a signal of
 * direction: they are not links, and they disappear the moment the Super Admin enables the sport.
 */
export const UPCOMING_SPORTS = [
  "Basketball",
  "Volleyball",
  "Hockey",
  "Table Tennis",
  "Athletics",
  "Swimming",
];
