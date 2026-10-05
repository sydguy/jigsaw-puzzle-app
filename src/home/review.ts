import { createContext, useContext } from "react";
import type { ImageSourcePropType } from "react-native";

export type HomePuzzle = {
  id: string;
  title: string;
  image: ImageSourcePropType;
  pieces: number;
  created: string;
  lastPlayed: string;
  progress: number;
};
export type HomeState = "empty" | "populated";
export const HomeReviewContext = createContext<{
  state: HomeState;
  puzzles: readonly HomePuzzle[];
  notify: (message: string) => void;
}>({ state: "empty", puzzles: [], notify: () => {} });
export const useHomeReview = () => useContext(HomeReviewContext);

export const sortOptions = ["Latest Played", "Latest Created", "Most Pieces"] as const;
export type HomeSort = (typeof sortOptions)[number];
export function sortPuzzles(puzzles: readonly HomePuzzle[], sort: HomeSort) {
  return [...puzzles].sort((a, b) => {
    const delta = sort === "Most Pieces" ? b.pieces - a.pieces
      : sort === "Latest Created" ? b.created.localeCompare(a.created)
      : b.lastPlayed.localeCompare(a.lastPlayed);
    return delta || a.id.localeCompare(b.id);
  });
}
