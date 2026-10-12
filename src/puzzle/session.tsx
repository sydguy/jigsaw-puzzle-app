import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform, Pressable, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import type { HomePuzzle } from "../home/review";
import { act, Action, advance, definition, newAttempt } from "../game/engine";
import { GameRecord, homePuzzle } from "../game/record";
import { snapshotImage } from "../game/image";
import { useGameLibrary } from "../game/library";
import GameDialog from "../game/Dialog";
export type PuzzleIntent = "create" | "replay" | "continue";
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const Context = createContext<ReturnType<typeof useSessionState> | null>(null);
function useSessionState() {
  const library = useGameLibrary();
  const [record, setRecord] = useState<GameRecord | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [preview, setPreview] = useState(false), [offlineSeconds, setOfflineSeconds] = useState<number | null>(null);
  const [replayRequest, setReplayRequest] = useState<HomePuzzle | null>(null);
  const current = useRef(record), pending = useRef<GameRecord | null>(null), queue = useRef(Promise.resolve());
  const jobs = useRef(0), lastTick = useRef(performance.now()), lastCheckpoint = useRef(performance.now());
  const previewResume = useRef(false), offlineAt = useRef<number | null>(null), foreground = useRef(true);
  const publish = (next: GameRecord | null) => { current.current = next; setRecord(next); };
  const syncClock = (now = performance.now()) => { const r = current.current;
    const until = offlineAt.current === null ? now : Math.min(now, offlineAt.current + 60000);
    if (r) { const attempt = advance(r.definition, r.attempt, until - lastTick.current); if (attempt !== r.attempt) publish({ ...r, attempt }); }
    lastTick.current = now;
  };
  const enqueue = (work: () => Promise<void>) => {
    jobs.current++; setBusy(true);
    const task = queue.current.then(work).catch(e => { setError(e instanceof Error ? e.message : "Could not save the puzzle."); });
    queue.current = task.finally(() => { jobs.current--; setBusy(jobs.current > 0); lastTick.current = performance.now(); });
    return queue.current;
  };
  const save = async (next: GameRecord) => {
    try { const saved = await library.save(next); publish(saved); pending.current = null; setError(""); lastCheckpoint.current = performance.now(); }
    catch (e) { pending.current = { ...next, attempt: { ...next.attempt, status: next.attempt.status === "running" ? "paused" : next.attempt.status } };
      const old = current.current; if (old) publish({ ...old, attempt: { ...old.attempt, status: old.attempt.status === "running" ? "paused" : old.attempt.status } }); throw e; }
  };
  const perform = (action: Action, rewardId?: string) => { const requestedAt = performance.now(); return enqueue(async () => {
    if (pending.current) return;
    syncClock(action.type === "pause" ? requestedAt : performance.now()); const r = current.current; if (!r) return;
    if (rewardId && r.rewardIds?.includes(rewardId)) return;
    if (action.type === "start" && (!foreground.current || (offlineAt.current !== null && performance.now() - offlineAt.current >= 60000))) return;
    const attempt = act(r.definition, r.attempt, action, Date.now());
    if (attempt === r.attempt) return;
    const started = r.attempt.startedAt === null && attempt.startedAt !== null;
    await save({ ...r, attempt, rewardIds: rewardId ? [...(r.rewardIds ?? []), rewardId] : r.rewardIds, attemptsStarted: r.attemptsStarted + (started ? 1 : 0), lastStartedAt: started ? attempt.startedAt : r.lastStartedAt });
  }); };
  const pause = () => { previewResume.current = false; return perform({ type: "pause" }); };
  const load = (id: string) => enqueue(async () => {
    if (current.current?.id === id) return;
    const r = library.get(id); if (!r) { setError("This puzzle could not be found in local storage."); return; }
    publish({ ...r, attempt: { ...r.attempt, status: r.attempt.status === "running" ? "paused" : r.attempt.status } });
    pending.current = null; setPreview(false); setError("");
  });
  const open = (puzzle: HomePuzzle, intent: PuzzleIntent, confirmed = false) => enqueue(async () => {
    if (library.loading) throw new Error("Saved puzzles are still loading. Please retry in a moment.");
    if (!puzzle.settings) throw new Error("Choose a puzzle configuration first.");
    let r = library.get(puzzle.id);
    if (r && intent === "replay" && r.attempt.startedAt !== null && r.attempt.status !== "completed" && !confirmed) { setReplayRequest(puzzle); return; }
    if (!r) {
      const image = await snapshotImage(puzzle);
      const d = definition(puzzle.settings.gridIndex + 5, puzzle.settings.rotation, puzzle.settings.timer);
      r = { schema: 1, revision: 0, id: puzzle.id, puzzle: { ...puzzle, image: { uri: image }, mobileImage: undefined, mobileCrop: undefined, progress: 0, reviewLastPlayedLabel: "Not yet" },
        definition: d, attempt: newAttempt(d, uid()), attemptsStarted: 0, lastStartedAt: null, history: [] };
    } else if (intent === "replay") {
      const { board, tray, turns, selected, ...summary } = r.attempt;
      r = { ...r, attempt: newAttempt(r.definition, uid()), history: [...r.history, summary] };
    } else r = { ...r, attempt: { ...r.attempt, status: r.attempt.status === "running" ? "paused" : r.attempt.status } };
    const saved = await library.save(r); publish(saved); pending.current = null; setError(""); setPreview(false);
    router.push({ pathname: "/puzzle", params: { id: r.id } });
  });
  const restart = () => { const r = current.current; return r ? open(homePuzzle(r), "replay", true) : Promise.resolve(); };
  const enterPreview = async () => { const running = current.current?.attempt.status === "running"; await perform({ type: "pause" }); previewResume.current = running && foreground.current; setPreview(true); };
  const closePreview = async () => { setPreview(false); const resume = previewResume.current; previewResume.current = false; if (resume) await perform({ type: "start" }); };
  const lifecycle = useRef({ pause, syncClock, perform, save }); lifecycle.current = { pause, syncClock, perform, save };
  useEffect(() => {
    const suspend = () => { foreground.current = false; void lifecycle.current.pause(); };
    const active = () => { foreground.current = true; lastTick.current = performance.now(); };
    const subscription = AppState.addEventListener("change", state => state === "active" ? active() : suspend());
    const visibility = () => document.hidden ? suspend() : active();
    const offline = () => { offlineAt.current ??= performance.now(); setOfflineSeconds(60); };
    const online = () => { offlineAt.current = null; setOfflineSeconds(null); };
    if (Platform.OS === "web") { document.addEventListener("visibilitychange", visibility); window.addEventListener("pagehide", suspend); window.addEventListener("offline", offline); window.addEventListener("online", online); if (!navigator.onLine) offline(); }
    const timer = setInterval(() => {
      if (offlineAt.current !== null) {
        const seconds = Math.max(0, Math.ceil((60000 - (performance.now() - offlineAt.current)) / 1000)); setOfflineSeconds(seconds);
        if (!seconds && current.current?.attempt.status === "running") { void lifecycle.current.pause(); return; }
      }
      if (jobs.current || pending.current || !foreground.current || current.current?.attempt.status !== "running") { lastTick.current = performance.now(); return; }
      lifecycle.current.syncClock();
      if ((current.current?.attempt.status as string) === "timeout" || performance.now() - lastCheckpoint.current >= 5000) void enqueue(async () => { if (current.current && !pending.current) await lifecycle.current.save(current.current); });
    }, 200);
    return () => { clearInterval(timer); subscription.remove(); if (Platform.OS === "web") { document.removeEventListener("visibilitychange", visibility); window.removeEventListener("pagehide", suspend); window.removeEventListener("offline", offline); window.removeEventListener("online", online); } };
  }, []);
  return { record, busy, error, preview, offlineSeconds, open, load, perform, pause, restart, enterPreview, closePreview, getRecord: () => current.current,
    replayRequest, cancelReplay: () => setReplayRequest(null), confirmReplay: () => { const p = replayRequest; setReplayRequest(null); if (p) void open(p, "replay", true); },
    retry: () => enqueue(async () => { if (pending.current) await save(pending.current); }),
    reloadSaved: () => enqueue(async () => { const id = current.current?.id; if (!await library.reload()) throw new Error("Could not reload saved puzzles. Your pending change is still available to retry."); if (id) { const saved = library.get(id); if (!saved) throw new Error("No valid saved puzzle is available. Your pending change has been kept."); publish({ ...saved, attempt: { ...saved.attempt, status: saved.attempt.status === "running" ? "paused" : saved.attempt.status } }); } pending.current = null; setError(""); }),
    clearError: () => setError(""), clear: () => publish(null) };
}
export function PuzzleSessionProvider({ children }: PropsWithChildren) {
  const value = useSessionState(), pathname = usePathname();
  return <Context.Provider value={value}>{!!value.error && (!value.record || pathname !== "/puzzle") && <View style={{ padding: 12, backgroundColor: "#fff1f1" }}><Text accessibilityRole="alert">{value.error}</Text><Pressable accessibilityRole="button" onPress={value.clearError} style={{ minHeight: 48, justifyContent: "center" }}><Text>Dismiss</Text></Pressable></View>}{children}
    {!!value.replayRequest && <GameDialog title="Play again from the start?" text="This starts a new attempt and clears the current board. The picture, cuts and settings stay the same." onCancel={value.cancelReplay} actions={[{ label: "Cancel", secondary: true, onPress: value.cancelReplay }, { label: "Play Again", onPress: value.confirmReplay }]}/>}
  </Context.Provider>;
}
export function usePuzzleSession() { const value = useContext(Context); if (!value) throw new Error("PuzzleSessionProvider missing"); return value; }
