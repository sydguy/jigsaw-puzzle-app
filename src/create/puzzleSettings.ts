import type { Draft } from "../local/types";

/** Compare values, not edit history: restoring all choices restores replay actions. */
export function samePuzzleSettings(a: Draft, b: Draft) {
  return a.gridIndex === b.gridIndex && a.timer === b.timer &&
    a.rotation === b.rotation && a.pictureId === b.pictureId;
}
