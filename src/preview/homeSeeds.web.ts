import type { HomePuzzle } from "../home/review";
import { theme } from "../theme";

// Visual fixtures only. Interactive setups below use approved linked grid sizes.
// Never pass these records to the gameplay engine, account services or local repository.
const seeds: readonly HomePuzzle[] = [
  { id: "seed-lakeside", title: "Lakeside Village", image: require("../../graphics/home-review/lakeside.png"), pieces: 100, created: "2026-09-04", lastPlayed: "2026-09-06T12:34:00", progress: 100 },
  { id: "seed-puppy", title: "Playful Puppy", image: require("../../graphics/home-review/puppy.png"), pieces: 64, created: "2026-09-03", lastPlayed: "2026-09-06T08:17:00", progress: 100 },
  { id: "seed-castle", title: "Fairy Tale Castle", image: require("../../graphics/home-review/castle.png"), pieces: 200, created: "2026-09-02", lastPlayed: "2026-09-05T23:48:00", progress: 68 },
  { id: "seed-autumn", title: "Autumn Reflections", image: require("../../graphics/home-review/autumn.png"), pieces: 96, created: "2026-08-28", lastPlayed: "2026-09-04T18:05:00", progress: 100 },
  { id: "seed-tropical", title: "Tropical Paradise", image: require("../../graphics/home-review/tropical.png"), pieces: 150, created: "2026-08-20", lastPlayed: "2026-09-03T12:16:00", progress: 40 },
];

// Reuse the exact owner-supplied thumbnail art for mobile review; no source pixels are edited.
// The full screenshot is never displayed as UI. All text, cards and controls remain real components.
const mobileImage = require("../../graphics/home-review/mobile-reference.png");
const cropY = [509, 666, 822, 982, 1143];
export const homeSeeds: readonly HomePuzzle[] = seeds.map((puzzle, index) => ({
  ...puzzle,
  // Explicit setup fixtures replace legacy mockup-only counts with valid linked grids.
  settings: { gridIndex: [3, 2, 5, 3, 4][index]!, timer: index % 2 ? "stopwatch" : "countdown", rotation: index === 2 },
  pieces: theme.puzzle.grids[[3, 2, 5, 3, 4][index]!]!.reduce<number>((a, b) => a * b, 1),
  mobileImage,
  mobileCrop: { x: 200, y: cropY[index]!, width: 192, height: 128, sourceWidth: 1024, sourceHeight: 1536 },
}));

export const mobileHomeSeeds: readonly HomePuzzle[] = [...homeSeeds.map(puzzle => ({
  ...puzzle,
  ...(puzzle.id === "seed-autumn" ? { created: "2026-09-01" } : {}),
  ...(puzzle.id === "seed-tropical" ? { created: "2026-08-28", lastPlayed: "2026-09-03T22:16:00" } : {}),
  // Verbatim design label only; retain a valid sortable timestamp separately.
  ...(puzzle.id === "seed-castle" ? { reviewLastPlayedLabel: "25:48" } : {}),
})),
  { id: "seed-sunset", title: "Sunset Retreat", image: require("../../graphics/home-review/autumn.png"), pieces: 96, settings: { gridIndex: 3, timer: "none", rotation: true }, created: "2026-08-24", lastPlayed: "2026-09-02T17:20:00", progress: 24 },
  { id: "seed-mountain", title: "Mountain Escape", image: require("../../graphics/home-review/lakeside.png"), pieces: 54, settings: { gridIndex: 2, timer: "countdown", rotation: false }, created: "2026-08-21", lastPlayed: "2026-09-01T09:15:00", progress: 100 },
];
