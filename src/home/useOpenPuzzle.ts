import { router } from "expo-router";
import { useLocal } from "../local/store";
import { useCreateReview } from "../create/review";
import type { HomePuzzle } from "./review";

export function useOpenPuzzle() {
  const { setDraft } = useLocal();
  const review = useCreateReview();
  return (puzzle: HomePuzzle) => {
    if (!review || !puzzle.settings) return;
    setDraft({ ...puzzle.settings });
    review.setSelectedPicture(puzzle);
    review.setHomePuzzle(puzzle);
    review.setState("after");
    review.notify("");
    router.push("/create");
  };
}
