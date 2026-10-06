import type { CollectionItem } from "../collection/review";
// Browser review only; never saved to the user's collection.
const seeds = [
  ["Mountain Lake", "Nature", require("../../graphics/create-review/mountain-lake.png"), 12],
  ["Playful Puppy", "Animals", require("../../graphics/home-review/puppy.png"), 8],
  ["Tropical Paradise", "Travel", require("../../graphics/home-review/tropical.png"), 15],
  ["Autumn Reflections", "Seasons", require("../../graphics/home-review/autumn.png"), 6],
  ["Woodland Fox", "Animals", require("../../graphics/curated-review/wildlife.png"), 10],
  ["Alpine Meadow", "Nature", require("../../graphics/curated-review/nature.png"), 7],
  ["Lakeside Village", "Architecture", require("../../graphics/home-review/lakeside.png"), 4],
  ["Fairy Tale Castle", "Architecture", require("../../graphics/home-review/castle.png"), 9],
  ["Fantasy Kingdom", "Fantasy", require("../../graphics/curated-review/fantasy.png"), 3],
] as const;
export const myCollectionSeeds: CollectionItem[] = Array.from({ length: 18 }, (_, i) => {
  const [title, theme, image, timesUsed] = seeds[i % seeds.length]!;
  return { id: `collection-review-${i + 1}`, title, theme, image, timesUsed, addedAt: Date.UTC(2026, 8, 5 - i), lastUsed: Date.UTC(2026, 8, 1 - i), sample: true };
});
