import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { Screen, Empty } from "../src/components/ui";
import BackButton from "../src/components/BackButton";
import PuzzleImage from "../src/components/PuzzleImage";
import { usePuzzleSession } from "../src/puzzle/session";
import { ProgressRing, ToolIcon, ToolName } from "../src/puzzle/PuzzleVisuals";
import { useDevice } from "../src/preview/context";
import { useCreateReview } from "../src/create/review";
import { useLocal } from "../src/local/store";
import { useGameLibrary } from "../src/game/library";
import { Action, correctCount } from "../src/game/engine";
import GameBoard from "../src/game/Board";
import GameDialog from "../src/game/Dialog";
import { browserReward, rewardOnce } from "../src/game/rewards";
import { feedback } from "../src/game/feedback";
import { art } from "../src/assets";
import { theme } from "../src/theme";
function gradient(a: string, b: string): ViewStyle { return Platform.OS === "web" ? { backgroundImage: `linear-gradient(135deg, ${a}, ${b})` } as ViewStyle : { backgroundColor: b }; }
const tools: { name: ToolName; key: "hint" | "preview" | "restart" | "shuffle" }[] = [
  { name: "Hint", key: "hint" }, { name: "Preview", key: "preview" }, { name: "Restart", key: "restart" }, { name: "Shuffle", key: "shuffle" },
];
const format = (milliseconds: number, remaining = false) => { const seconds = Math.max(0, (remaining ? Math.ceil : Math.floor)(milliseconds / 1000)); return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`; };
export default function PuzzlePage() {
  const game = usePuzzleSession(), library = useGameLibrary(), review = useCreateReview(), local = useLocal();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const pathname = usePathname();
  const { width, height, tablet } = useDevice();
  const [zoom, setZoom] = useState(1), [message, setMessage] = useState(""), [confirm, setConfirm] = useState(false), [rewarding, setRewarding] = useState(false);
  const [dismissedWin, setDismissedWin] = useState<string | null>(null);
  const restartResume = useRef(false), rewardBusy = useRef(false), lastMoves = useRef(0);
  const current = useRef(game); current.current = game;
  useEffect(() => { if (id && !library.loading) void current.current.load(id); }, [id, library.loading]);
  useEffect(() => { return () => { void current.current.pause(); }; }, []);
  useEffect(() => { if (pathname !== "/puzzle") void current.current.pause(); }, [pathname]);
  useEffect(() => { setZoom(1); setDismissedWin(null); lastMoves.current = game.record?.attempt.moves ?? 0; }, [game.record?.attempt.id]);
  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(""), 4500); return () => clearTimeout(timer); }, [message]);
  useEffect(() => { const count = game.record?.attempt.moves ?? 0; if (count > lastMoves.current) feedback(local.preferences); lastMoves.current = count; }, [game.record?.attempt.moves]);
  const home = async () => { await game.pause(); review?.setHomePuzzle(null); router.dismissTo("/"); };
  if (!game.record || (id && game.record.id !== id)) return <Screen title="Puzzle" back={() => void home()}><Empty title={library.loading || game.busy ? "Loading puzzle…" : "Choose a puzzle first"} description={game.error || library.issue || "Open a puzzle from Home or create one from a picture."} source={art.ready} action={{ label: "Go to Home", onPress: () => void home() }}/></Screen>;
  const r = game.record, a = r.attempt, d = r.definition, total = d.side ** 2, placed = correctCount(a), percent = a.status === "completed" ? 100 : Math.min(99, Math.round(placed / total * 100));
  const panelWidth = Math.min(width - 32, tablet ? 620 : width - 32), boardWidth = tablet ? panelWidth : Math.min(panelWidth, Math.max(220, height - 513));
  const running = a.status === "running", blocked = !running || game.busy || !!game.error || rewarding || confirm;
  const stateLabel = running ? "Pause" : a.status === "ready" ? "Start Playing" : a.status === "paused" ? "Resume" : a.status === "timeout" ? "Time’s up" : "Completed";
  const dispatch = (action: Action) => { if (!blocked) void game.perform(action); };
  const requestRestart = async () => { restartResume.current = running; await game.pause(); setConfirm(true); };
  const cancelRestart = () => { setConfirm(false); if (restartResume.current) void game.perform({ type: "start" }); };
  const reward = async (kind: "hint" | "untimed") => {
    if (rewardBusy.current) return; rewardBusy.current = true; setRewarding(true);
    try {
      const resume = running; await game.pause();
      const rewardId = `${a.id}-${kind}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const grant = rewardOnce(async () => { if (kind === "hint") { if (!resume) return; await game.perform({ type: "start" }); await game.perform({ type: "hint" }, rewardId); }
        else await game.perform({ type: "untimed" }, rewardId); });
      const outcome = await browserReward(); await grant(outcome);
      if (outcome === "cancelled" && resume) await game.perform({ type: "start" });
      setMessage(outcome === "cancelled" ? "Cancelled. No reward was used." : !game.getRecord()?.rewardIds?.includes(rewardId) ? "Play is paused. Resolve the interruption before continuing." : kind === "hint" ? "Hint placed one piece." : "Continue without a time limit. This attempt will be recorded as untimed.");
    } finally { rewardBusy.current = false; setRewarding(false); }
  };
  const controls = <View style={s.boardControls}>
    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>{d.rotation ? <Pressable accessibilityRole="button" accessibilityLabel="Rotate selected piece" disabled={blocked || a.selected === null} onPress={() => dispatch({ type: "rotate" })} style={s.rotate}>
      <Text style={[s.configuration, { color: theme.color.primary }]}>{d.side} × {d.side} · Rotate ↻</Text>
    </Pressable> : <Text style={s.configuration}>{d.side} × {d.side}{a.selected === null ? " · Rotation off" : ""}</Text>}
    {a.selected !== null && a.board.includes(a.selected) && <Pressable accessibilityRole="button" accessibilityLabel="Return selected piece to tray" disabled={blocked} onPress={() => dispatch({ type: "return", piece: a.selected! })} style={s.zoom}><Text style={s.fit}>Tray ↓</Text></Pressable>}</View>
    <View style={s.zoomControls}><Pressable accessibilityRole="button" accessibilityLabel="Zoom out" disabled={zoom <= 1} onPress={() => setZoom(v => Math.max(1, v - .25))} style={s.zoom}><Text style={s.zoomText}>−</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Fit puzzle" onPress={() => setZoom(1)} style={s.zoom}><Text style={s.fit}>Fit</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" disabled={zoom >= 4} onPress={() => setZoom(v => Math.min(4, v + .25))} style={s.zoom}><Text style={s.zoomText}>+</Text></Pressable></View>
  </View>;
  return <Screen showScrollbar contentStyle={[s.content, tablet && { alignItems: "center" }]} fixedContent={<View style={s.header}><BackButton onPress={() => void (game.preview ? game.closePreview() : home())}/><Text accessibilityRole="header" numberOfLines={1} style={s.title}>{game.preview ? "Preview" : r.puzzle.title}</Text><View style={{ width: 48 }}/></View>}>
    {game.preview ? <View style={{ width: boardWidth, alignSelf: "center", gap: 16 }} testID="puzzle-preview"><PuzzleImage {...r.puzzle} square/>
      <Text style={s.configuration}>Clock paused while viewing the picture.</Text><Pressable accessibilityRole="button" accessibilityLabel="Close preview" onPress={() => void game.closePreview()} style={[s.close, gradient(theme.color.gradientStart, theme.color.gradientEnd)]}><Text style={s.white}>Back to puzzle</Text></Pressable></View>
      : <View style={[s.stack, { width: panelWidth }]} testID="puzzle-screen">
        <View style={s.summary} testID="puzzle-summary"><View accessibilityRole="progressbar" accessibilityLabel="Puzzle progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} accessibilityValue={{ min: 0, max: 100, now: percent }}><ProgressRing percent={percent}/></View>
          <View style={s.stats}><Text style={s.statMain}>{placed} / {total} pieces placed</Text><Text testID="game-moves" style={s.stat}>Moves: {a.moves}</Text>
            <Text testID="game-clock" style={s.clock}>{d.timer === "none" ? "Timer off" : format(d.durationMs !== null && !a.continuedUntimed ? d.durationMs - a.elapsedMs : a.elapsedMs, d.durationMs !== null && !a.continuedUntimed)}</Text>
            <Text style={s.mode}>{a.continuedUntimed ? "Untimed continuation" : d.timer === "countdown" ? "Timer" : d.timer === "none" ? "Untimed" : "Stopwatch"}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={stateLabel} disabled={game.busy || !!game.error || rewarding || !["ready", "running", "paused"].includes(a.status) || game.offlineSeconds === 0} onPress={() => void (running ? game.pause() : game.perform({ type: "start" }))} style={s.startTarget}>
            <View style={[s.startFace, gradient(theme.color.gradientStart, theme.color.gradientEnd)]}>{running ? <Text style={[s.white, { fontSize: 26 }]}>Ⅱ</Text> : <ToolIcon name="Play" size={30}/>}</View><Text style={s.startLabel}>{stateLabel}</Text></Pressable>
        </View>
        <GameBoard record={r} size={boardWidth} zoom={zoom} setZoom={setZoom} disabled={blocked} dispatch={dispatch} onError={setMessage} controls={controls}/>
        <View style={s.tools} testID="puzzle-tools">{tools.map(({ name, key }) => <Pressable key={key} accessibilityRole="button" accessibilityLabel={name} disabled={game.busy || rewarding || (name !== "Preview" && name !== "Restart" && blocked)}
          onPress={() => { if (name === "Preview") void game.enterPreview(); else if (name === "Restart") void requestRestart(); else if (name === "Hint") void reward("hint"); else dispatch({ type: "shuffle" }); }} style={[s.toolTarget, name !== "Preview" && name !== "Restart" && blocked && { opacity: .55 }]}>
          <View style={[s.toolFace, gradient(theme.gradient[key].colors[0], theme.gradient[key].colors[1])]}><ToolIcon name={name}/></View><Text style={s.toolLabel}>{name.toUpperCase()}</Text></Pressable>)}</View>
        <View style={s.ad} accessibilityLabel="Ad banner placeholder"><Text style={s.adLabel}>Ad Banner</Text></View>
        {!!game.error && <View accessibilityRole="alert"><Text style={s.configuration}>{game.error}</Text><Pressable accessibilityRole="button" onPress={() => void game.retry()} style={s.close}><Text>Retry save</Text></Pressable><Pressable accessibilityRole="button" onPress={() => void game.reloadSaved()} style={s.close}><Text>Reload last saved puzzle</Text></Pressable></View>}
        {game.offlineSeconds !== null && <Text role="status" style={s.configuration}>{game.offlineSeconds ? `Connection lost. Play pauses in ${game.offlineSeconds}s.` : "Play paused. Reconnect, then tap Resume."}</Text>}
        {!!message && !game.error && <View pointerEvents="none" style={{ position: "absolute", left: 8, right: 8, bottom: 4, backgroundColor: theme.color.surfaceSoft }}><Text role="status" style={[s.configuration, { textAlign: "center" }]}>{message}</Text></View>}
      </View>}
    {confirm && <GameDialog title="Restart this puzzle?" text="Start a new attempt with the same picture, cuts and settings. The current board will be cleared and the pieces shuffled." onCancel={cancelRestart}
      actions={[{ label: "Cancel", secondary: true, onPress: cancelRestart }, { label: "Restart puzzle", onPress: () => { setConfirm(false); void game.restart(); } }]}/>}
    {a.status === "timeout" && !confirm && !rewarding && <GameDialog title="Time’s up" text="Continue without a time limit, restart this puzzle, or return Home. An untimed continuation will not count as a timed success."
      actions={[{ label: "Continue untimed", onPress: () => void reward("untimed") }, { label: "Restart puzzle", secondary: true, onPress: () => void requestRestart() }, { label: "Home", secondary: true, onPress: () => void home() }]}/>}
    {a.status === "completed" && dismissedWin !== a.id && !confirm && <GameDialog celebrate title="Puzzle completed!" text={`${total} pieces · ${a.moves} moves${d.timer === "none" ? "" : ` · ${format(a.elapsedMs)}`}\n${a.continuedUntimed || d.timer === "none" ? "Completed untimed." : d.timer === "countdown" ? "Completed within the time limit!" : "Stopwatch result."}`}
      onCancel={() => setDismissedWin(a.id)} actions={[{ label: "View picture", secondary: true, onPress: () => { setDismissedWin(a.id); void game.enterPreview(); } }, { label: "Play Again", onPress: () => void game.restart() }, { label: "Home", secondary: true, onPress: () => void home() }]}/>}
  </Screen>;
}
const s = StyleSheet.create({
  content: { padding: 16, paddingTop: 8, paddingBottom: 12 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { flex: 1, color: theme.color.text, textAlign: "center", fontSize: 22, lineHeight: 28, fontWeight: "700" }, stack: { gap: 12 },
  summary: { flexDirection: "row", alignItems: "center", backgroundColor: theme.color.surface, borderRadius: 14, padding: 10, gap: 10, boxShadow: "0 4px 16px #3521740f" },
  stats: { flex: 1, borderLeftWidth: 1, borderLeftColor: theme.color.border, paddingLeft: 10, gap: 3 }, statMain: { fontSize: 12, lineHeight: 17, fontWeight: "600", color: theme.color.text }, stat: { fontSize: 12, lineHeight: 17, color: theme.color.text },
  clock: { fontSize: 20, lineHeight: 25, fontWeight: "700", color: theme.color.text, fontVariant: ["tabular-nums"] }, mode: { fontSize: 10, lineHeight: 13, color: theme.color.textSecondary },
  startTarget: { width: 70, minHeight: 78, alignItems: "center", justifyContent: "center", gap: 4 }, startFace: { width: 62, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.primary }, startLabel: { fontSize: 11, lineHeight: 15, fontWeight: "600", color: theme.color.text },
  boardControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 }, configuration: { fontSize: 12, lineHeight: 16, color: theme.color.textSecondary }, zoomControls: { flexDirection: "row" }, zoom: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" }, zoomText: { fontSize: 24, color: theme.color.primary }, fit: { fontSize: 12, fontWeight: "600", color: theme.color.primary }, rotate: { minHeight: 48, justifyContent: "center" },
  tools: { flexDirection: "row", justifyContent: "space-between", gap: 8, backgroundColor: theme.color.surface, borderRadius: 14, padding: 10 }, toolTarget: { flex: 1, minHeight: 76, alignItems: "center", gap: 5 }, toolFace: { width: "100%", maxWidth: 64, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" }, toolLabel: { fontSize: 10, lineHeight: 15, fontWeight: "600", color: theme.color.text },
  ad: { height: 50, borderRadius: 12, backgroundColor: theme.color.disabledSurface, alignItems: "center", justifyContent: "center" }, adLabel: { fontSize: 14, color: theme.color.disabledText }, close: { minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" }, white: { color: theme.color.surface, fontSize: 16, fontWeight: "600" },
});
