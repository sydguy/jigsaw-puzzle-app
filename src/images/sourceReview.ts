import { createContext, useContext } from "react";

export const SourceReviewContext = createContext<(message: string) => void>(() => {});
export const useSourceReviewNotice = () => useContext(SourceReviewContext);
