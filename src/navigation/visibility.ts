import { createContext } from "react";

// Screens can hide the whole bar for a focused subflow without removing triggers.
export const TabVisibility = createContext<(hidden: boolean) => void>(() => {});
