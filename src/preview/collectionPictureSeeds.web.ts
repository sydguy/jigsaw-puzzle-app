// Development visual-review fixtures. Never catalogue records or acquisition authority.
// Reuse existing original seed art, including repeats to exercise scrolling.
const art = [
  { title: "Mountain Lake", image: require("../../graphics/create-review/mountain-lake.png") },
  { title: "Alpine Meadow", image: require("../../graphics/curated-review/nature.png") },
  { title: "Autumn Reflections", image: require("../../graphics/home-review/autumn.png") },
  { title: "Tropical Paradise", image: require("../../graphics/home-review/tropical.png") },
  { title: "Lakeside Village", image: require("../../graphics/home-review/lakeside.png") },
  { title: "Woodland Fox", image: require("../../graphics/curated-review/wildlife.png") },
  { title: "Fairy Tale Castle", image: require("../../graphics/home-review/castle.png") },
  { title: "Playful Puppy", image: require("../../graphics/home-review/puppy.png") },
  { title: "Fantasy Kingdom", image: require("../../graphics/curated-review/fantasy.png") },
];
export const collectionPictureSeeds = Array.from({ length: 21 }, (_, index) => ({
  ...art[index % art.length]!, id: `sample-${index + 1}`, owned: [4, 6, 11, 13].includes(index),
}));
