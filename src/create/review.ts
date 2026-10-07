import { createContext, useContext } from "react";
import type { ImageSourcePropType } from "react-native";
import type { HomePuzzle } from "../home/review";

export type CreateReviewState = "before" | "after";
export type ReviewPicture = { title: string; image: ImageSourcePropType; mobileImage?: HomePuzzle["mobileImage"]; mobileCrop?: HomePuzzle["mobileCrop"] };
// Browser development fixtures never enter the local collection or puzzle draft.
export const CreateReviewContext = createContext<{
  state: CreateReviewState;
  setState: (state: CreateReviewState) => void;
  image: ImageSourcePropType;
  selectedPicture: ReviewPicture | null;
  setSelectedPicture: (picture: ReviewPicture | null) => void;
  homePuzzle: HomePuzzle | null;
  setHomePuzzle: (puzzle: HomePuzzle | null) => void;
  notify: (message: string) => void;
} | null>(null);
export const useCreateReview = () => useContext(CreateReviewContext);
