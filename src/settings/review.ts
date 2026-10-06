import { createContext, useContext } from "react";
export type ReviewProfile = { fullName: string; email: string };
export type ReviewPrivacy = { analytics: boolean; marketing: boolean };
export const SettingsReviewContext = createContext<{
  signedIn: boolean; setSignedIn: (value: boolean) => void; notify: (message: string) => void;
  profile: ReviewProfile; setProfile: (profile: ReviewProfile) => void;
  privacy: ReviewPrivacy; setPrivacy: (privacy: ReviewPrivacy) => void;
} | null>(null);
export const useSettingsReview = () => useContext(SettingsReviewContext);
