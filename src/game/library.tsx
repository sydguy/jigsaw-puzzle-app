import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { GameRecord } from "./record";
import * as repository from "./repository";
const Context = createContext<ReturnType<typeof useLibraryState> | null>(null);
function useLibraryState() {
  const [records, setRecords] = useState<GameRecord[]>([]), [issue, setIssue] = useState(""), [loading, setLoading] = useState(true);
  const current = useRef(records); current.current = records;
  const reload = async () => { setLoading(true); try { const result = await repository.readGames(); current.current = result.records; setRecords(result.records); setIssue(result.issues.join(" ")); return true; }
    catch (e) { setIssue(e instanceof Error ? e.message : "Could not load puzzles."); return false; } finally { setLoading(false); } };
  useEffect(() => { void reload(); }, []);
  const save = async (r: GameRecord) => { const next = await repository.writeGame(r, r.revision);
    current.current = [next, ...current.current.filter(old => old.id !== r.id)]; setRecords(current.current); return next; };
  const remove = async (id: string) => { await repository.deleteGame(id); current.current = current.current.filter(r => r.id !== id); setRecords(current.current); };
  return { records, issue, loading, reload, save, remove, get: (id: string) => current.current.find(r => r.id === id) };
}
export function GameLibraryProvider({ children }: PropsWithChildren) { return <Context.Provider value={useLibraryState()}>{children}</Context.Provider>; }
export function useGameLibrary() { const value = useContext(Context); if (!value) throw new Error("Game library missing"); return value; }
