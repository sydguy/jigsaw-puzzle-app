import { createContext, useContext } from "react";
export const SettingsReviewContext = createContext<{
  signedIn: boolean; setSignedIn: (value: boolean) => void; notify: (message: string) => void;
} | null>(null);
export const useSettingsReview = () => useContext(SettingsReviewContext);
