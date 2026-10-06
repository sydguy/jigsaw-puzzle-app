// Visual review fixtures only; never catalogue inventory or purchase allowances.
export const curatedSeeds = [
  { id: "free", title: "Free Collection", count: 50, premium: false, image: require("../../graphics/create-review/mountain-lake.png") },
  { id: "nature", title: "Nature Collection", count: 100, premium: true, image: require("../../graphics/curated-review/nature.png") },
  { id: "wildlife", title: "Wildlife Collection", count: 100, premium: true, image: require("../../graphics/curated-review/wildlife.png") },
  { id: "fantasy", title: "Fantasy Collection", count: 100, premium: true, image: require("../../graphics/curated-review/fantasy.png") },
  { id: "village", title: "Village Collection", count: 100, premium: true, image: require("../../graphics/home-review/lakeside.png") },
  { id: "pets", title: "Pets Collection", count: 100, premium: true, image: require("../../graphics/home-review/puppy.png") },
  { id: "tropical", title: "Tropical Collection", count: 100, premium: true, image: require("../../graphics/home-review/tropical.png") },
] as const;
