import type { GameRecord } from "./record";
export async function readGames(): Promise<{ records: GameRecord[]; issues: string[] }> { return { records: [], issues: [] }; }
export async function writeGame(_record: GameRecord, _expectedRevision: number): Promise<GameRecord> { throw new Error("Native puzzle storage is not connected. Use the browser game for this development iteration."); }
export async function deleteGame(_id: string): Promise<void> { throw new Error("Native puzzle storage is not connected."); }
