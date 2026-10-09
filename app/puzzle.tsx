import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";
import { router } from "expo-router";
import { Screen, Empty } from "../src/components/ui";
import BackButton from "../src/components/BackButton";
import PuzzleImage from "../src/components/PuzzleImage";
import { usePuzzleSession } from "../src/puzzle/session";
import { BoardSeams, ProgressRing, ToolIcon, TrayPiece, ToolName } from "../src/puzzle/PuzzleVisuals";
import { useDevice } from "../src/preview/context";
import { useCreateReview } from "../src/create/review";
import { art } from "../src/assets";
import { theme } from "../src/theme";

function gradient(a: string, b: string): ViewStyle { return Platform.OS === "web" ? { backgroundImage: `linear-gradient(135deg, ${a}, ${b})` } as ViewStyle : { backgroundColor: b }; }
const tools: { name: ToolName; key: "hint" | "preview" | "restart" | "shuffle" }[] = [
  { name: "Hint", key: "hint" }, { name: "Preview", key: "preview" }, { name: "Restart", key: "restart" }, { name: "Shuffle", key: "shuffle" },
];

export default function PuzzlePage() {
  const { session } = usePuzzleSession();
  const review = useCreateReview();
  const { width, height, tablet } = useDevice();
  const [preview, setPreview] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [message, setMessage] = useState("");
  const home = () => { review?.setHomePuzzle(null); router.dismissTo("/"); };
  if (!session?.puzzle.settings) return <Screen title="Puzzle" back={home}><Empty title="Choose a puzzle first" description="Open a puzzle from Home or create one from a picture." source={art.ready} action={{ label: "Go to Home", onPress: home }}/></Screen>;
  const { puzzle, intent } = session;
  const settings = puzzle.settings!;
  const [rows, columns] = theme.puzzle.grids[settings.gridIndex]!;
  const total = rows * columns;
  const placed = intent === "continue" ? Math.round(total * puzzle.progress / 100) : 0;
  const percent = Math.round(placed / total * 100);
  const boardWidth = Math.min(width - 32, tablet ? 620 : width - 32);
  const unavailable = (action: string) => {
    const text = `${action} will be available when gameplay is connected.`;
    setMessage(text); review?.notify(text);
  };
  return <Screen showScrollbar contentStyle={[s.content, { minHeight: height - 64, gap: height > 860 ? 18 : 12 }, tablet && { alignItems: "center" }]} fixedContent={
    <View style={s.header}><BackButton onPress={preview ? () => setPreview(false) : home}/><Text accessibilityRole="header" numberOfLines={1} style={s.title}>{preview ? "Preview" : puzzle.title}</Text><View style={{ width: 48 }}/></View>
  }>
    {preview ? <View style={{ width: boardWidth, flex: 1, justifyContent: "center", gap: 16 }} testID="puzzle-preview">
      <PuzzleImage {...puzzle}/><Text style={s.previewTitle}>{puzzle.title}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Close preview" onPress={() => setPreview(false)} style={[s.close, gradient(theme.color.gradientStart, theme.color.gradientEnd)]}><Text style={s.white}>Back to puzzle</Text></Pressable>
    </View> : <View style={[s.stack, { width: boardWidth }]} testID="puzzle-screen">
      <View style={s.summary} testID="puzzle-summary">
        <View accessibilityRole="progressbar" accessibilityLabel="Puzzle progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} accessibilityValue={{ min: 0, max: 100, now: percent }}><ProgressRing percent={percent}/></View>
        <View style={s.stats}>
          <Text style={s.statMain}>{placed} / {total} pieces placed</Text>
          <Text style={s.stat}>Moves: {intent === "continue" ? "—" : "0"}</Text>
          <Text style={s.clock}>{settings.timer === "none" ? "Timer off" : settings.timer === "countdown" ? "--:--" : intent === "continue" ? "--:--" : "00:00"}</Text>
          <Text style={s.mode}>{settings.timer === "none" ? "Untimed" : settings.timer === "countdown" ? "Timer" : "Stopwatch"}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={intent === "continue" ? "Continue Playing" : "Start Playing"} onPress={() => unavailable("Playing")} style={s.startTarget}>
          <View style={[s.startFace, gradient(theme.color.gradientStart, theme.color.gradientEnd)]}><ToolIcon name="Play" size={30}/></View>
          <Text style={s.startLabel}>{intent === "continue" ? "Continue" : "Start Playing"}</Text>
        </Pressable>
      </View>
      <View style={s.boardSpace}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, width: boardWidth }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={{ width: boardWidth * zoom, height: boardWidth / 1.5 }}>
            <View testID="puzzle-board" accessibilityLabel={`${rows} rows by ${columns} columns, ${total} pieces`} style={{ width: boardWidth * zoom, aspectRatio: 1.5, borderRadius: 12, overflow: "hidden" }}>
              <PuzzleImage {...puzzle}/><BoardSeams rows={rows} columns={columns}/>
            </View>
          </ScrollView>
        </ScrollView>
        <View style={s.boardControls}>
          <Text testID="puzzle-configuration" style={s.configuration}>{rows} × {columns} · Rotation {settings.rotation ? "on" : "off"}</Text>
          <View style={s.zoomControls}>
            <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" disabled={zoom === 1} onPress={() => setZoom(value => Math.max(1, value - .25))} style={s.zoom}><Text style={s.zoomText}>−</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Fit puzzle" onPress={() => setZoom(1)} style={s.zoom}><Text style={s.fit}>Fit</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" disabled={zoom === 2} onPress={() => setZoom(value => Math.min(2, value + .25))} style={s.zoom}><Text style={s.zoomText}>+</Text></Pressable>
          </View>
        </View>
      </View>
      <View style={s.tray} testID="puzzle-tray">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel="Puzzle piece tray" contentContainerStyle={{ gap: 10, paddingHorizontal: 8, alignItems: "center" }}>
          {Array.from({ length: Math.min(24, Math.max(0, total - placed)) }, (_, index) => <TrayPiece key={index} puzzle={puzzle} index={index}/>)}
        </ScrollView>
      </View>
      <View style={s.tools} testID="puzzle-tools">
        {tools.map(({ name, key }) => <Pressable key={key} accessibilityRole="button" accessibilityLabel={name} onPress={() => name === "Preview" ? setPreview(true) : unavailable(name)} style={s.toolTarget}>
          <View style={[s.toolFace, gradient(theme.gradient[key].colors[0], theme.gradient[key].colors[1])]}><ToolIcon name={name}/></View><Text style={s.toolLabel}>{name.toUpperCase()}</Text>
        </Pressable>)}
      </View>
      {settings.rotation && <Pressable accessibilityRole="button" accessibilityLabel="Rotate selected piece" onPress={() => unavailable("Piece rotation")} style={s.rotate}><Text style={s.configuration}>↻ Rotate selected piece</Text></Pressable>}
      <View style={s.ad} accessibilityLabel="Ad banner placeholder"><Text style={s.adLabel}>Ad Banner</Text></View>
      {!review && !!message && <Text accessibilityRole="alert" style={s.configuration}>{message}</Text>}
    </View>}
  </Screen>;
}

const s = StyleSheet.create({
  content: { padding: 16, paddingTop: 8, paddingBottom: 12 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { flex: 1, color: theme.color.text, textAlign: "center", fontSize: 22, lineHeight: 28, fontWeight: "700" },
  stack: { flexGrow: 1, gap: 12 },
  summary: { flexDirection: "row", alignItems: "center", backgroundColor: theme.color.surface, borderRadius: 14, padding: 10, gap: 10, boxShadow: "0 4px 16px #3521740f" },
  stats: { flex: 1, borderLeftWidth: 1, borderLeftColor: theme.color.border, paddingLeft: 10, gap: 3 },
  statMain: { fontSize: 12, lineHeight: 17, fontWeight: "600", color: theme.color.text },
  stat: { fontSize: 12, lineHeight: 17, color: theme.color.text },
  clock: { fontSize: 20, lineHeight: 25, fontWeight: "700", color: theme.color.text, fontVariant: ["tabular-nums"] },
  mode: { fontSize: 10, lineHeight: 13, color: theme.color.textSecondary },
  startTarget: { width: 70, minHeight: 78, alignItems: "center", justifyContent: "center", gap: 4 },
  startFace: { width: 62, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.primary },
  startLabel: { fontSize: 11, lineHeight: 15, fontWeight: "600", color: theme.color.text },
  boardSpace: { flexGrow: 1, justifyContent: "center" },
  boardControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  configuration: { fontSize: 12, lineHeight: 16, color: theme.color.textSecondary },
  zoomControls: { flexDirection: "row" }, zoom: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  zoomText: { fontSize: 24, color: theme.color.primary }, fit: { fontSize: 12, fontWeight: "600", color: theme.color.primary },
  tray: { backgroundColor: theme.color.surface, borderRadius: 14, paddingVertical: 10, minHeight: 86, boxShadow: "0 4px 16px #3521740f" },
  tools: { flexDirection: "row", justifyContent: "space-between", gap: 8, backgroundColor: theme.color.surface, borderRadius: 14, padding: 10 },
  toolTarget: { flex: 1, minHeight: 76, alignItems: "center", gap: 5 },
  toolFace: { width: "100%", maxWidth: 64, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  toolLabel: { fontSize: 10, lineHeight: 15, fontWeight: "600", color: theme.color.text },
  ad: { height: 50, borderRadius: 12, backgroundColor: theme.color.disabledSurface, alignItems: "center", justifyContent: "center" },
  adLabel: { fontSize: 14, color: theme.color.disabledText },
  rotate: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  previewTitle: { fontSize: 18, lineHeight: 24, textAlign: "center", color: theme.color.text, fontWeight: "600" },
  close: { minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  white: { color: theme.color.surface, fontSize: 16, fontWeight: "600" },
});
