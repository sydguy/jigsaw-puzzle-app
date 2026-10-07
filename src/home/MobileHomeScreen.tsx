import { memo, useEffect, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { router } from "expo-router";
import { art } from "../assets";
import { Art, Screen } from "../components/ui";
import { theme } from "../theme";
import { useDevice } from "../preview/context";
import { HomePuzzle, HomeSort, sortPuzzles, useHomeReview } from "./review";
import SortMenu from "./SortMenu";
import SwipePuzzleRow from "./SwipePuzzleRow";
import { useOpenPuzzle } from "./useOpenPuzzle";
import { useCreateReview } from "../create/review";

// Mobile-only density measured from the owner's latest 1024px references.
// Keep readable scaling and real controls; never scale/rasterize the whole screen.
const gradient = Platform.OS === "web" ? {
  backgroundImage: "linear-gradient(110deg, " + theme.color.gradientStart + ", " + theme.color.gradientEnd + ")",
} as ViewStyle : {};

function CompactButton({ label, onPress, play = false }: { label: string; onPress: () => void; play?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={event => { event.stopPropagation(); onPress(); }}
    style={({ pressed }) => [s.buttonTarget, pressed && { opacity: 0.8 }]}>
    <View style={[s.buttonFace, gradient]}>
      {play && <Text accessible={false} style={s.play}>▶</Text>}
      <Text style={s.buttonLabel}>{label}</Text>
    </View>
  </Pressable>;
}

function Decoration({ right = false }: { right?: boolean }) {
  return <View pointerEvents="none" accessible={false} style={[s.decoration, right ? { right: 12 } : { left: 12 }]}>
    {[{ size: 42, x: 7, y: 0, angle: "-24deg" }, { size: 34, x: 37, y: 34, angle: "17deg" }, { size: 26, x: 2, y: 58, angle: "-16deg" }].map((p, i) =>
      <Image key={i} accessible={false} source={art.piece} resizeMode="contain"
        style={{ position: "absolute", left: p.x, top: p.y, width: p.size, height: p.size, tintColor: theme.color.primary, transform: [{ rotate: p.angle }] }} />)}
  </View>;
}

function Thumbnail({ puzzle, width }: { puzzle: HomePuzzle; width: number }) {
  const crop = puzzle.mobileCrop;
  if (crop && puzzle.mobileImage) {
    const scale = width / crop.width;
    return <View testID="puzzle-thumbnail" accessibilityRole="image" accessibilityLabel={puzzle.title + " puzzle image"}
      style={{ width, height: width / 1.5, overflow: "hidden", borderRadius: 7, flexShrink: 0 }}>
      <Image accessible={false} source={puzzle.mobileImage} resizeMode="stretch" style={{ position: "absolute",
        width: crop.sourceWidth * scale, height: crop.sourceHeight * scale, left: -crop.x * scale, top: -crop.y * scale }} />
    </View>;
  }
  return <Image testID="puzzle-thumbnail" accessibilityLabel={puzzle.title + " puzzle image"} source={puzzle.image}
    resizeMode="contain" style={{ width, height: width / 1.5, borderRadius: 7, flexShrink: 0 }} />;
}

function Status({ puzzle }: { puzzle: HomePuzzle }) {
  if (puzzle.progress === 100) return <View testID="puzzle-status" style={[s.status, s.completed]}>
    <View style={s.checkCircle}><Text accessible={false} style={s.check}>✓</Text></View>
    <Text style={s.completedLabel}>Completed</Text>
  </View>;
  return <View testID="puzzle-status" accessibilityRole="progressbar" accessibilityLabel={puzzle.title + " progress"}
    accessibilityValue={{ min: 0, max: 100, now: puzzle.progress }} style={[s.status, s.progress]}>
    <Text style={s.progressLabel}>In Progress</Text>
    <View style={s.progressLine}>
      <View style={s.track}><View style={[s.fill, gradient, { width: (puzzle.progress + "%") as `${number}%` }]} /></View>
      <Text style={s.progressValue}>{puzzle.progress}%</Text>
    </View>
  </View>;
}

const PuzzleRow = memo(function PuzzleRow({ puzzle }: { puzzle: HomePuzzle }) {
  const { width } = useDevice();
  const openPuzzle = useOpenPuzzle();
  const imageWidth = Math.round((width - 32) * 0.3);
  const actionWidth = Math.round((width - 32) * 0.285);
  const date = new Date(puzzle.created + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }).replace("Sept", "Sep");
  return <Pressable testID="home-puzzle-row" accessibilityRole="link" accessibilityLabel={"Open " + puzzle.title} onPress={() => openPuzzle(puzzle)} style={s.puzzleRow}>
    <Thumbnail puzzle={puzzle} width={imageWidth} />
    <View style={s.metadata}>
      <Text style={s.puzzleTitle}>{puzzle.title}</Text>
      <View style={s.dateRow}><Text style={s.caption}>Created on</Text><Text style={s.caption}>{date}</Text></View>
      <View style={s.dateRow}><Text style={s.caption}>Last played</Text><Text style={s.caption}>{puzzle.reviewLastPlayedLabel ?? puzzle.lastPlayed.slice(11, 16)}</Text></View>
      <View style={s.pieceCount}><Image accessible={false} source={art.piece} resizeMode="contain" style={s.pieceIcon} /><Text style={s.caption}>{puzzle.pieces}</Text></View>
    </View>
    <View testID="puzzle-actions" style={{ width: actionWidth, flexShrink: 0 }}>
      <Status puzzle={puzzle} />
      <View testID="puzzle-action"><CompactButton label={puzzle.progress === 100 ? "Play Again" : "Continue"} play
        onPress={() => openPuzzle(puzzle)} /></View>
    </View>
  </Pressable>;
});

export default function MobileHomeScreen() {
  const review = useHomeReview();
  const createReview = useCreateReview();
  const [sort, setSort] = useState<HomeSort>("Latest Played");
  const [deleted, setDeleted] = useState<string[]>([]);
  const [openRow, setOpenRow] = useState<string | null>(null);
  useEffect(() => { setDeleted([]); setOpenRow(null); }, [review.state]);
  const puzzles = sortPuzzles(review.puzzles.filter(puzzle => !deleted.includes(puzzle.id)), sort);
  const empty = puzzles.length === 0;
  const hasPacks = review.state === "populated";
  return <Screen tab="Home" floatingTabs contentStyle={{ gap: 6, paddingTop: 0, paddingBottom: 12 }}
    fixedContent={<View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6, gap: 10 }}>
    <View testID="home-allowance" style={s.allowance}>
      <Image source={art.crown} accessible={false} resizeMode="contain" style={s.crown} />
      <View style={s.allowanceText}>
        <Text accessibilityRole="header" style={s.allowanceTitle}>Theme Collection</Text>
        {!hasPacks ? <Text style={s.noPacks}>No purchased packs</Text> : <View accessibilityLabel="75 of 100 pictures used; 2 of 3 themes used" style={s.balanceRow}>
          <Text style={s.balance}>75/100 <Text style={s.balanceUnit}>pictures</Text></Text>
          <Text style={s.balance}>2/3 <Text style={s.balanceUnit}>themes</Text></Text>
        </View>}
      </View>
      <View style={{ width: 108 }}><CompactButton label="Buy Theme Packs"
        onPress={() => review.notify("Theme-pack purchases are not connected in this Home review. No purchase or balance change was made.")} /></View>
    </View>
    <Pressable testID="home-add-puzzle" accessibilityRole="button" accessibilityLabel="Add Puzzle" onPress={() => { createReview?.setHomePuzzle(null); createReview?.notify(""); router.push("/create"); }}
      style={({ pressed }) => [s.hero, pressed && { opacity: 0.85 }]}>
      <Decoration /><Decoration right />
      <View testID="add-puzzle-circle" accessible={false} style={[s.plus, gradient]}>
        <View testID="add-puzzle-plus" style={s.plusGlyph}>
          <View style={s.plusHorizontal} /><View style={s.plusVertical} />
        </View>
      </View>
      <Text style={s.heroTitle}>Add Puzzle</Text>
      <Text style={s.heroSubtitle}>Add your own photos and create a puzzle</Text>
    </Pressable>
      <View testID="home-list-header" style={s.listHeader}>
        <Text accessibilityRole="header" style={s.heading}>My Puzzles ({puzzles.length})</Text>
        <View style={s.sortRow}><Text style={s.sortLabel}>Sort by:</Text><SortMenu compact value={sort} onChange={setSort} /></View>
      </View>
    </View>}>
      {empty ? <View testID="home-empty" style={s.empty}>
        <Art source={art.ready} size={112} />
        <Text accessibilityRole="header" style={s.emptyTitle}>Your first puzzle awaits</Text>
        <Text style={s.emptyDescription}>Start with a picture you love. Your puzzles and progress will appear here.</Text>
      </View> : puzzles.map(puzzle => <SwipePuzzleRow key={puzzle.id} title={puzzle.title} open={openRow === puzzle.id}
        onOpenChange={open => setOpenRow(open ? puzzle.id : null)}
        onDelete={() => {
          setDeleted(current => [...current, puzzle.id]); setOpenRow(null);
          review.notify(puzzle.title + " was removed from this seed preview only. Collection pictures are unchanged. Switch Home review states or reload to reset.");
        }}><PuzzleRow puzzle={puzzle} /></SwipePuzzleRow>)}
  </Screen>;
}

const s = StyleSheet.create({
  allowance: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: theme.color.surface, borderRadius: 12, boxShadow: "0 2px 8px #35217414", borderWidth: 1, borderColor: theme.color.border },
  crown: { width: 38, height: 38, flexShrink: 0, tintColor: "#E69A2D" },
  allowanceText: { flex: 1, minWidth: 0, gap: 2 },
  allowanceTitle: { fontSize: 16, lineHeight: 20, fontWeight: "700", color: theme.color.text },
  noPacks: { fontSize: 12, lineHeight: 16, color: theme.color.textSecondary },
  balanceRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  balance: { fontSize: 14, lineHeight: 18, fontWeight: "700", color: theme.color.primary },
  balanceUnit: { fontSize: 10, fontWeight: "400", color: theme.color.textSecondary },
  buttonTarget: { minHeight: 48, justifyContent: "center", width: "100%" },
  buttonFace: { minHeight: 32, width: "100%", borderRadius: 7, paddingHorizontal: 7, paddingVertical: 6, backgroundColor: theme.color.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7 },
  buttonLabel: { fontSize: 11, lineHeight: 16, color: theme.color.surface, flexShrink: 1 },
  play: { fontSize: 17, color: theme.color.surface },
  hero: { minHeight: 116, borderRadius: 14, borderWidth: 1, borderColor: theme.color.border, backgroundColor: theme.color.surfaceSoft, alignItems: "center", justifyContent: "center", paddingHorizontal: 8, paddingVertical: 10, gap: 4, overflow: "hidden" },
  decoration: { position: "absolute", top: 14, width: 72, height: 86, opacity: 0.16 },
  plus: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.primary },
  plusGlyph: { width: 24, height: 24, position: "relative" },
  plusHorizontal: { position: "absolute", width: 24, height: 4, left: 0, top: 10, borderRadius: 2, backgroundColor: theme.color.surface },
  plusVertical: { position: "absolute", width: 4, height: 24, left: 10, top: 0, borderRadius: 2, backgroundColor: theme.color.surface },
  heroTitle: { fontSize: 20, lineHeight: 25, fontWeight: "700", color: theme.color.primary },
  heroSubtitle: { fontSize: 11, lineHeight: 16, color: theme.color.primary, textAlign: "center" },
  listHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 4, zIndex: 10 },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: "700", color: theme.color.text },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 10, marginLeft: "auto" },
  sortLabel: { fontSize: 10, lineHeight: 14, color: theme.color.textSecondary },
  puzzleRow: { minHeight: 84, flexDirection: "row", alignItems: "center", padding: 4, gap: 8, borderRadius: 12, backgroundColor: theme.color.surface, boxShadow: "0 2px 8px #35217408" },
  metadata: { flex: 1, minWidth: 0, gap: 3 },
  puzzleTitle: { fontSize: 13, lineHeight: 17, fontWeight: "700", color: theme.color.text },
  caption: { fontSize: 10, lineHeight: 14, color: theme.color.textSecondary },
  dateRow: { flexDirection: "row", flexWrap: "wrap", columnGap: 6, rowGap: 0 },
  pieceCount: { flexDirection: "row", alignItems: "center", gap: 6 },
  pieceIcon: { width: 13, height: 13, tintColor: theme.color.textSecondary },
  status: { minHeight: 28, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7 },
  completed: { backgroundColor: theme.color.successSoft, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  checkCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: theme.color.success, alignItems: "center", justifyContent: "center" },
  check: { color: theme.color.surface, fontSize: 14, lineHeight: 18 },
  completedLabel: { fontSize: 10, lineHeight: 14, color: theme.color.success },
  progress: { backgroundColor: theme.color.surfaceSoft, gap: 2, paddingVertical: 2 },
  progressLabel: { color: theme.color.primary, fontSize: 10, lineHeight: 12 },
  progressLine: { flexDirection: "row", alignItems: "center", gap: 4 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: theme.color.selected, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4, backgroundColor: theme.color.primary },
  progressValue: { fontSize: 10, lineHeight: 10, fontWeight: "600", color: theme.color.primary },
  empty: { minHeight: 244, paddingVertical: 20, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: theme.color.border, backgroundColor: theme.color.surface, alignItems: "center", gap: 16 },
  emptyTitle: { fontSize: 20, lineHeight: 26, fontWeight: "700", color: theme.color.text, textAlign: "center" },
  emptyDescription: { fontSize: 14, lineHeight: 20, textAlign: "center", color: theme.color.textSecondary },
});
