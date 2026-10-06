import { createContext, useContext } from "react";
import type { ImageSourcePropType } from "react-native";

export type CreateReviewState = "before" | "after";
// Browser development fixtures never enter the local collection or puzzle draft.
export const CreateReviewContext = createContext<{
  state: CreateReviewState;
  setState: (state: CreateReviewState) => void;
  image: ImageSourcePropType;
} | null>(null);
export const useCreateReview = () => useContext(CreateReviewContext);
