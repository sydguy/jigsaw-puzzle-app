import type { HomePuzzle } from "../home/review";

// Visual fixtures only: deliberately reproduce the mockup values, including legacy counts.
// Never pass these records to the gameplay engine, account services or local repository.
export const homeSeeds: readonly HomePuzzle[] = [
  { id: "seed-lakeside", title: "Lakeside Village", image: require("../../graphics/home-review/lakeside.png"), pieces: 100, created: "2026-09-04", lastPlayed: "2026-09-06T12:34:00", progress: 100 },
  { id: "seed-puppy", title: "Playful Puppy", image: require("../../graphics/home-review/puppy.png"), pieces: 64, created: "2026-09-03", lastPlayed: "2026-09-06T08:17:00", progress: 100 },
  { id: "seed-castle", title: "Fairy Tale Castle", image: require("../../graphics/home-review/castle.png"), pieces: 200, created: "2026-09-02", lastPlayed: "2026-09-05T23:48:00", progress: 68 },
  { id: "seed-autumn", title: "Autumn Reflections", image: require("../../graphics/home-review/autumn.png"), pieces: 96, created: "2026-08-28", lastPlayed: "2026-09-04T18:05:00", progress: 100 },
  { id: "seed-tropical", title: "Tropical Paradise", image: require("../../graphics/home-review/tropical.png"), pieces: 150, created: "2026-08-20", lastPlayed: "2026-09-03T12:16:00", progress: 40 },
];
