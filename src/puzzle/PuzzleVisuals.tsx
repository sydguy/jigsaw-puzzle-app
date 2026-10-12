import { Text, View } from "react-native";
import PuzzleImage from "../components/PuzzleImage";
import type { HomePuzzle } from "../home/review";
import { theme } from "../theme";
export function ProgressRing({ percent }: { percent: number }) {
  return <View style={{ width: 78, height: 78, borderRadius: 39, borderWidth: 7, borderColor: theme.color.primary, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 22, fontWeight: "700", color: theme.color.text }}>{percent}%</Text></View>;
}
export function BoardSeams({ rows, columns }: { rows: number; columns: number }) {
  return <View pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: rows - 1 }, (_, i) => <View key={`r${i}`} style={{ position: "absolute", top: `${(i + 1) / rows * 100}%`, width: "100%", height: 1, backgroundColor: "#17124f55" }} />)}
    {Array.from({ length: columns - 1 }, (_, i) => <View key={`c${i}`} style={{ position: "absolute", left: `${(i + 1) / columns * 100}%`, height: "100%", width: 1, backgroundColor: "#17124f55" }} />)}
  </View>;
}
export function TrayPiece({ puzzle }: { puzzle: HomePuzzle; index: number }) { return <View style={{ width: 64, height: 66, justifyContent: "center" }}><PuzzleImage {...puzzle} square/></View>; }
export type ToolName = "Hint" | "Preview" | "Restart" | "Shuffle" | "Play" | "Rotate";
export function ToolIcon({ name, size = 28 }: { name: ToolName; size?: number }) { return <Text accessible={false} style={{ fontSize: size, color: "white" }}>{({ Hint: "☀", Preview: "◉", Restart: "↻", Shuffle: "⇄", Play: "▶", Rotate: "↻" })[name]}</Text>; }
