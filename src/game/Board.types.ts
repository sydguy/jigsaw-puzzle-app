import type { GameRecord } from "./record";
import type { Action } from "./engine";
import type { ReactNode } from "react";
export type GameBoardProps = { record: GameRecord; size: number; zoom: number; setZoom: (zoom: number) => void; disabled: boolean;
  dispatch: (action: Action) => void; onError: (message: string) => void; controls?: ReactNode };
