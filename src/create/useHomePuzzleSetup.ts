import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { useLocal } from "../local/store";
import { useHomeReview } from "../home/review";
import { theme } from "../theme";
import { useCreateReview } from "./review";
import { samePuzzleSettings } from "./puzzleSettings";

export function useHomePuzzleSetup() {
  const { draft, pictures } = useLocal();
  const review = useCreateReview();
  const home = useHomeReview();
  const submitted = useRef(false);
  const original = review?.homePuzzle;
  const selected = review?.selectedPicture;
  const localPicture = pictures.find(item => item.id === draft.pictureId);
  const image = selected?.image ?? (localPicture ? { uri: localPicture.data } : undefined);
  const sameImage = selected?.image === original?.image && selected?.mobileCrop === original?.mobileCrop;
  const changed = !!original?.settings && (!samePuzzleSettings(draft, original.settings) || !sameImage);
  const canContinue = !!original && original.progress < 100;
  const notify = review?.notify;
  useEffect(() => { submitted.current = false; }, [original?.id]);
  useEffect(() => { notify?.(""); }, [original?.id, changed, notify]);
  return {
    original, changed, canContinue,
    heading: canContinue ? "Continue Playing or Play Again or create a new Puzzle?" : "Play Again or create a new Puzzle?",
    description: canContinue
      ? "Pick up where you left off, or restart.\nChange settings to make a new puzzle."
      : "Completed! Play again with this setup.\nChange settings to make a new puzzle.",
    create: () => {
      if (!original || !changed || !image || !home.addPuzzle || submitted.current) return;
      submitted.current = true;
      const now = new Date().toISOString();
      const [rows, columns] = theme.puzzle.grids[draft.gridIndex]!;
      home.addPuzzle({
        id: `review-${now}-${Math.random().toString(36).slice(2)}`,
        title: selected?.title ?? localPicture?.title ?? original.title,
        image, mobileImage: selected?.mobileImage, mobileCrop: selected?.mobileCrop,
        settings: { ...draft }, pieces: rows * columns, progress: 0,
        created: now.slice(0, 10), lastPlayed: "", reviewLastPlayedLabel: "Not yet",
      });
      review?.setHomePuzzle(null);
      router.dismissTo("/");
    },
    requestPlay: (action: "Play Again" | "Continue Playing") => {
      if (!original || changed) return;
      review?.notify(`${action}: ${original.title}. Gameplay is not connected yet. The existing puzzle and its progress have not been changed.`);
    },
  };
}
