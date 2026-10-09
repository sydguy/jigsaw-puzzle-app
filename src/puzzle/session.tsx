import { createContext, PropsWithChildren, useContext, useState } from "react";
import { router } from "expo-router";
import type { HomePuzzle } from "../home/review";

export type PuzzleIntent = "create" | "replay" | "continue";
export type PuzzleSession = { puzzle: HomePuzzle; intent: PuzzleIntent };
const Context = createContext<{
  session: PuzzleSession | null;
  open: (puzzle: HomePuzzle, intent: PuzzleIntent) => void;
} | null>(null);

/** Presentation handoff only. No attempt, timer, cut or progress mutation. */
export function PuzzleSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<PuzzleSession | null>(null);
  return <Context.Provider value={{ session, open: (puzzle, intent) => {
    if (!puzzle.settings) return;
    setSession({ puzzle: { ...puzzle, settings: { ...puzzle.settings } }, intent });
    router.push("/puzzle");
  } }}>{children}</Context.Provider>;
}
export function usePuzzleSession() {
  const value = useContext(Context);
  if (!value) throw new Error("PuzzleSessionProvider missing");
  return value;
}
