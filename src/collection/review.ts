import { createContext, useContext } from "react";
import { ImageSourcePropType } from "react-native";
export type CollectionItem = { id: string; title: string; theme: string; image: ImageSourcePropType; addedAt: number; lastUsed: number | null; timesUsed: number; sample: boolean };
export const CollectionReviewContext = createContext<{ items: CollectionItem[] } | null>(null);
export const useCollectionReview = () => useContext(CollectionReviewContext);
