import { useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { router } from "expo-router";
import { art } from "../assets";
import { Art, Screen } from "../components/ui";
import { theme } from "../theme";
import { useDevice } from "../preview/context";
import { HomePuzzle, HomeSort, sortPuzzles, useHomeReview } from "./review";
import SortMenu from "./SortMenu";
import MobileHomeScreen from "./MobileHomeScreen";

const gradient = Platform.OS === "web" ? { backgroundImage: "linear-gradient(110deg, " + theme.color.gradientStart + ", " + theme.color.gradientEnd + ")" } as ViewStyle : {};
function HomeButton({ label, onPress, play = false }: { label: string; onPress: () => void; play?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => [s.button, gradient, play && { paddingHorizontal: 8 }, pressed && { opacity: 0.85 }]}>
    {play && <Text accessible={false} style={{ color: theme.color.surface, fontSize: 16 }}>▶</Text>}
    <Text style={s.buttonText}>{label}</Text>
  </Pressable>;
}
function Decoration({ right = false }: { right?: boolean }) {
  const { tablet } = useDevice();
  return <View pointerEvents="none" accessible={false} style={{ position: "absolute", top: 24, [right ? "right" : "left"]: tablet ? 24 : 8, width: tablet ? 144 : 64, height: 120, opacity: 0.14 }}>
    {[{ size: tablet ? 68 : 38, x: 8, y: 0, angle: "-25deg" }, { size: tablet ? 54 : 28, x: tablet ? 70 : 34, y: tablet ? 56 : 40, angle: "20deg" }, { size: tablet ? 36 : 20, x: 0, y: tablet ? 82 : 56, angle: "-12deg" }].map((p, i) =>
      <Image key={i} accessible={false} source={art.piece} resizeMode="contain" style={{ position: "absolute", width: p.size, height: p.size, left: p.x, top: p.y, tintColor: theme.color.primary, transform: [{ rotate: p.angle }] }} />)}
  </View>;
}
function PuzzleStatus({ puzzle }: { puzzle: HomePuzzle }) {
  if (puzzle.progress === 100) return <View testID="puzzle-status" style={[s.status, { backgroundColor: theme.color.successSoft }]}>
    <Text accessible={false} style={{ color: theme.color.success, fontSize: 20 }}>✓</Text><Text style={[s.label, { color: theme.color.success }]}>Completed</Text>
  </View>;
  return <View testID="puzzle-status" accessibilityRole="progressbar" accessibilityLabel={puzzle.title + " progress"}
    accessibilityValue={{ min: 0, max: 100, now: puzzle.progress }} style={[s.status, { backgroundColor: theme.color.surfaceSoft, flexDirection: "column", alignItems: "stretch", gap: 4 }]}>
    <Text style={[s.label, { color: theme.color.primary }]}>In progress</Text>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={s.track}><View style={[s.fill, { width: (puzzle.progress + "%") as `${number}%` }, gradient]} /></View>
      <Text style={[s.caption, { color: theme.color.primary, fontWeight: "600" }]}>{puzzle.progress}%</Text>
    </View>
  </View>;
}
function PuzzleRow({ puzzle }: { puzzle: HomePuzzle }) {
  const { tablet, width, height } = useDevice();
  const landscape = tablet && width > height;
  const imageWidth = tablet ? (landscape ? 240 : 216) : 80;
  const review = useHomeReview();
  const actions = <View testID="puzzle-actions" style={{ flexDirection: landscape ? "row" : "column", gap: 8, width: landscape ? 304 : tablet ? "100%" : 112, maxWidth: "100%" }}>
    <View style={{ flex: landscape ? 1 : undefined }}><PuzzleStatus puzzle={puzzle} /></View>
    <View testID="puzzle-action" style={{ flex: landscape ? 1 : undefined }}><HomeButton label={puzzle.progress === 100 ? "Play Again" : "Continue"} play
      onPress={() => review.notify(puzzle.title + " is seed data for Home review. Gameplay is not connected; nothing was changed.")} /></View>
  </View>;
  const date = new Date(puzzle.created + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  return <View testID="home-puzzle-row" accessibilityLabel={puzzle.title} style={[s.card, { flexDirection: "row", alignItems: "center", gap: tablet ? 16 : 8 }]}>
    <Image testID="puzzle-thumbnail" accessibilityLabel={puzzle.title + " puzzle image"} source={puzzle.image} resizeMode="contain"
      style={{ width: imageWidth, height: imageWidth / 1.5, borderRadius: theme.radius.small, alignSelf: "center" }} />
    <View style={{ flex: 1, gap: 8, minWidth: 0 }}>
      <Text style={[s.label, tablet && s.section]}>{puzzle.title}</Text>
      <View style={{ flexDirection: landscape ? "row" : "column", gap: 4, flexWrap: "wrap" }}>
        <Text style={s.caption}>Created: {date}</Text><Text style={s.caption}>{landscape ? " · " : ""}Last played: {puzzle.lastPlayed.slice(11, 16)}</Text>
      </View>
      <Text style={s.caption}>{puzzle.pieces} pieces</Text>
      {tablet && !landscape && actions}
    </View>
    {(!tablet || landscape) && actions}
  </View>;
}
export default function HomeScreen() {
  const { tablet } = useDevice();
  return tablet ? <TabletHomeScreen /> : <MobileHomeScreen />;
}
function TabletHomeScreen() {
  const review = useHomeReview();
  const { tablet } = useDevice();
  const [sort, setSort] = useState<HomeSort>("Latest Played");
  const puzzles = sortPuzzles(review.puzzles, sort);
  return <Screen tab="Home" contentStyle={{ gap: 24 }}>
    <View testID="home-allowance" style={[s.card, { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12 }]}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center", flexGrow: 1, flexShrink: 1 }}>
        <Art source={art.crown} size={48} /><View style={{ flexShrink: 1, gap: 4 }}>
          <Text accessibilityRole="header" style={s.section}>Theme Collection</Text>
          {review.state === "populated" && <Text style={s.caption}>75 of 100 pictures used · 2 of 3 themes used</Text>}
        </View>
      </View>
      {review.state === "empty" && <HomeButton label="Buy theme packs" onPress={() => review.notify("Theme-pack purchases are not connected in this Home review. No purchase or balance change was made.")} />}
    </View>
    <Pressable testID="home-add-puzzle" accessibilityRole="button" accessibilityLabel="Add Puzzle" onPress={() => router.push("/create")}
      style={({ pressed }) => [s.hero, pressed && { opacity: 0.85 }]}>
      <Decoration /><Decoration right />
      <View style={[s.plus, gradient]}><Text accessible={false} style={{ fontSize: 36, lineHeight: 44, color: theme.color.surface }}>+</Text></View>
      <Text style={s.heroTitle}>Add Puzzle</Text>
      <Text style={[s.body, { color: theme.color.primary, textAlign: "center" }]}>Choose a picture and make it a puzzle</Text>
    </Pressable>
    <View style={{ gap: 12 }}>
      <View testID="home-list-header" style={s.listHeader}>
        <Text accessibilityRole="header" style={s.section}>My Puzzles ({puzzles.length})</Text><SortMenu value={sort} onChange={setSort} />
      </View>
      {puzzles.length === 0 ? <View testID="home-empty" style={[s.card, { alignItems: "center", gap: 20, paddingVertical: tablet ? 40 : 32 }]}>
        <Art source={art.ready} size={112} />
        <Text accessibilityRole="header" style={[s.section, { textAlign: "center" }]}>Your first puzzle awaits</Text>
        <Text style={[s.body, { textAlign: "center", color: theme.color.textSecondary, maxWidth: 480 }]}>Start with a picture you love. Your puzzles and progress will appear here.</Text>
      </View> : puzzles.map(puzzle => <PuzzleRow key={puzzle.id} puzzle={puzzle} />)}
    </View>
  </Screen>;
}
const s = StyleSheet.create({
  card: { backgroundColor: theme.color.surface, borderColor: theme.color.border, borderWidth: 1, borderRadius: theme.radius.card, padding: 16, boxShadow: "0 4px 16px #3521740f" },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "600", color: theme.color.text },
  section: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: theme.color.text },
  body: { fontSize: 16, lineHeight: 24, color: theme.color.text },
  caption: { fontSize: 12, lineHeight: 16, color: theme.color.textSecondary },
  button: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 12, borderRadius: theme.radius.control, backgroundColor: theme.color.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  buttonText: { fontSize: 14, lineHeight: 20, fontWeight: "600", color: theme.color.surface, flexShrink: 1, textAlign: "center" },
  hero: { backgroundColor: theme.color.surfaceSoft, borderColor: theme.color.border, borderWidth: 1, borderRadius: theme.radius.card, padding: 24, alignItems: "center", gap: 8, overflow: "hidden" },
  plus: { width: 48, height: 48, borderRadius: theme.radius.pill, backgroundColor: theme.color.primary, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 24, lineHeight: 32, fontWeight: "700", color: theme.color.primary },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", zIndex: 10 },
  status: { minHeight: 48, borderRadius: theme.radius.small, padding: 8, gap: 4, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  track: { flex: 1, height: 8, borderRadius: theme.radius.pill, backgroundColor: theme.color.selected, overflow: "hidden" },
  fill: { height: "100%", borderRadius: theme.radius.pill, backgroundColor: theme.color.primary },
});
