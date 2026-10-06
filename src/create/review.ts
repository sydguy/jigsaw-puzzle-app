import { createContext, useContext } from "react";
import type { ImageSourcePropType } from "react-native";

export type CreateReviewState = "before" | "after";
export type ReviewPicture = { title: string; image: ImageSourcePropType };
// Browser development fixtures never enter the local collection or puzzle draft.
export const CreateReviewContext = createContext<{
  state: CreateReviewState;
  setState: (state: CreateReviewState) => void;
  image: ImageSourcePropType;
  selectedPicture: ReviewPicture | null;
  setSelectedPicture: (picture: ReviewPicture | null) => void;
} | null>(null);
export const useCreateReview = () => useContext(CreateReviewContext);
