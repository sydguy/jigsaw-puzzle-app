import { KeyboardEvent, useEffect } from "react";
import { Image, ImageSourcePropType, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { router } from "expo-router";
import { art } from "../assets";
import { Art, Screen } from "../components/ui";
import { useLocal } from "../local/store";
import { Draft } from "../local/types";
import { MAX_BYTES } from "../images/limits";
import { theme } from "../theme";
import { useDevice } from "../preview/context";
import { useCreateReview } from "./review";
import BackButton from "../components/BackButton";

const modes: { value: Draft["timer"]; label: string }[] = [
  { value: "countdown", label: "Timer" },
  { value: "stopwatch", label: "Stopwatch" },
  { value: "none", label: "None" },
];
const primaryGradient = Platform.OS === "web" ? {
  backgroundImage: `linear-gradient(110deg, ${theme.color.gradientStart}, ${theme.color.gradientEnd})`,
} as ViewStyle : {};

/** Mobile-only geometry. Tablet layout remains in app/create.tsx for its own review. */
export default function MobileCreatePuzzle() {
  const { draft, setDraft, pictures } = useLocal();
  const { height } = useDevice();
  const compact = height <= 860;
  const [rows, columns] = theme.puzzle.grids[draft.gridIndex]!;
  const picture = pictures.find(item => item.id === draft.pictureId);
  const review = useCreateReview();
  const setReviewState = review?.setState;
  useEffect(() => {
    if (picture) setReviewState?.("after");
  }, [picture?.id, setReviewState]);
  const hasImage = review ? review.state === "after" : !!picture;
  const imageSource = review?.selectedPicture?.image ?? (picture ? { uri: picture.data } : review?.image);
  const step = (delta: number) => setDraft(value => ({
    ...value, gridIndex: Math.max(0, Math.min(theme.puzzle.grids.length - 1, value.gridIndex + delta)),
  }));
  const chooseImage = () => router.push("/sources?returnTo=create");
  return (
    <Screen showScrollbar={false} contentStyle={[s.content, compact && s.compactContent, hasImage && s.populatedContent, hasImage && compact && s.compactPopulatedContent]} fixedContent={
      <View style={[s.header, compact && s.compactHeader]} testID="create-mobile-header">
        <BackButton onPress={() => router.dismissTo("/")} />
        <Text accessibilityRole="header" style={s.title}>Create Puzzle</Text>
        <View style={s.headerBalance} />
      </View>
    }>
      <View style={s.readyOuter} testID="create-ready-card">
        <View style={s.ready}>
          <Art source={art.ready} size={compact || hasImage ? 68 : 84} />
          <View style={s.readyCopy}>
            <Text accessibilityRole="header" style={s.readyTitle}>Ready to Create?</Text>
            <Text style={s.readyBody}>Choose an image, set your puzzle size and timer mode, then create your puzzle!</Text>
          </View>
        </View>
      </View>
      <View style={s.imageSection} testID="create-image-section">
        {hasImage && imageSource ? <View style={s.selectedImage}>
            <View style={s.pictureFrame} testID="create-selected-picture">
              <Image accessibilityLabel={review?.selectedPicture?.title ?? picture?.title ?? "Mountain lake sample"} source={imageSource}
                resizeMode="contain" style={s.picture} />
            </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Change image" onPress={chooseImage} style={s.changeTarget}>
            <View style={s.changeFace}>
              <View accessible={false} style={s.cameraGlyph}><View style={s.cameraTop} /><View style={s.cameraLens} /></View>
              <Text style={s.changeLabel}>Change image</Text>
            </View>
          </Pressable>
        </View> : <Pressable accessibilityRole="button" accessibilityLabel="Add Image"
          accessibilityHint="Choose an image source" onPress={chooseImage} style={s.imagePrompt}>
          <View style={s.cameraBox}>
            <Image source={art.addImage} accessible={false} resizeMode="contain" style={s.camera} />
          </View>
          <Text style={s.addTitle}>Add Image</Text>
          <Text style={s.imageCopy}>Add your own photo to create a puzzle</Text>
          <Text style={s.caption}>JPG, PNG up to {MAX_BYTES / (1024 * 1024)} MB</Text>
        </Pressable>}
      </View>

      <View style={[s.card, hasImage && s.populatedSizeCard]} testID="create-size-card">
        <SectionTitle source={art.piece}>Puzzle size</SectionTitle>
        <View style={s.steppers}>
          {(["Rows", "Columns"] as const).map((label, index) => <View style={s.stepColumn} key={label}>
            <Text style={s.label}>{label}</Text>
            <View style={s.stepper}>
              <Step label={`Decrease ${label}`} disabled={draft.gridIndex === 0} onPress={() => step(-1)} />
              <Text accessibilityLabel={`${label}: ${index ? columns : rows}`} style={s.value}>{index ? columns : rows}</Text>
              <Step plus label={`Increase ${label}`} disabled={draft.gridIndex === theme.puzzle.grids.length - 1} onPress={() => step(1)} />
            </View>
          </View>)}
        </View>
        <View style={s.divider} />
        <View style={s.quickHeading}>
          <Text style={s.label}>Quick Picks</Text><Text style={s.caption}>Popular sizes</Text>
        </View>
        <View style={s.presets}>
          {theme.puzzle.presets.map(count => {
            const index = theme.puzzle.grids.findIndex(([r, c]) => r * c === count);
            const [r, c] = theme.puzzle.grids[index]!;
            const selected = draft.gridIndex === index;
            return <Pressable key={count} accessibilityRole="button" accessibilityLabel={`${count} pieces`}
              aria-selected={selected}
              accessibilityState={{ selected }} onPress={() => setDraft(value => ({ ...value, gridIndex: index }))}
              style={[s.preset, hasImage && s.populatedPreset, selected && s.presetSelected]}>
              {selected && <Text accessible={false} style={s.presetTick}>✓</Text>}
              <Text style={s.presetGrid}>{r} × {c}</Text>
              <Text style={s.presetCount}>{count} pieces</Text>
            </Pressable>;
          })}
        </View>
      </View>

      <View style={[s.card, s.timerCard]} testID="create-timer-card">
        <SectionTitle source={art.timer}>Timer mode</SectionTitle>
        <View style={s.segmentTrack} accessibilityRole="radiogroup" accessibilityLabel="Timer mode">
          <View pointerEvents="none" style={s.segmentBackdrop} />
          {modes.map(mode => <Pressable key={mode.value} accessibilityRole="radio"
            aria-checked={draft.timer === mode.value}
            tabIndex={draft.timer === mode.value ? 0 : -1}
            {...(Platform.OS === "web" ? { onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
              const index = modes.findIndex(item => item.value === mode.value);
              const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? (index + 1) % modes.length
                : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (index + modes.length - 1) % modes.length
                : event.key === "Home" ? 0 : event.key === "End" ? modes.length - 1 : event.key === " " ? index : -1;
              if (next < 0) return;
              event.preventDefault();
              setDraft(value => ({ ...value, timer: modes[next]!.value }));
              event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
            } } : {})}
            accessibilityLabel={mode.label} accessibilityState={{ checked: draft.timer === mode.value }}
            accessibilityHint={mode.value === "none" ? "Play with the timer off" : mode.value === "countdown" ? "Count down from the puzzle time limit" : "Count up without a time limit"}
            onPress={() => setDraft(value => ({ ...value, timer: mode.value }))}
            style={s.segment}>
            <View style={[s.segmentFace, draft.timer === mode.value && s.segmentSelected, draft.timer === mode.value && primaryGradient]}>
              <Text style={[s.segmentLabel, draft.timer === mode.value && s.segmentLabelSelected]}>{mode.label}</Text>
            </View>
          </Pressable>)}
        </View>
      </View>

      <Pressable style={[s.card, s.rotation]} testID="create-rotation-card"
        accessibilityRole="switch" accessibilityLabel="Rotate pieces" aria-checked={draft.rotation}
        {...(Platform.OS === "web" ? { onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === " ") { event.preventDefault(); setDraft(value => ({ ...value, rotation: !value.rotation })); }
        } } : {})}
        accessibilityState={{ checked: draft.rotation }} onPress={() => setDraft(value => ({ ...value, rotation: !value.rotation }))}>
        <Art source={art.rotate} size={40} />
        <View style={s.rotationCopy}>
          <Text style={s.label}>Rotate pieces</Text>
          <Text style={s.caption}>Pieces start at random angles. Rotate them to fit.</Text>
        </View>
        <View style={s.switchTarget} pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View testID="create-rotation-track" style={[s.switchTrack, draft.rotation && s.switchOn]}>
            <View style={[s.switchThumb, draft.rotation && s.switchThumbOn]} />
          </View>
        </View>
      </Pressable>

      <View style={s.footer}>
        <Pressable accessibilityRole="button" accessibilityLabel="Create Puzzle" accessibilityState={{ disabled: true }}
          disabled style={[s.createDisabled, hasImage && s.createPreview, hasImage && primaryGradient]}>
          <Text style={[s.createLabel, hasImage && s.createPreviewLabel]}>Create Puzzle</Text>
        </Pressable>
        {!review && <Text style={s.footerNote}>{picture
          ? "Puzzle setup only for now. Play will be available when the gameplay engine is connected."
          : "Choose a picture first. Play is not available in this preview yet."}</Text>}
      </View>
    </Screen>
  );
}

function SectionTitle({ source, children }: { source: ImageSourcePropType; children: string }) {
  return <View style={s.sectionHeader}><Art source={source} size={32} />
    <Text accessibilityRole="header" style={s.sectionTitle}>{children}</Text></View>;
}

function Step({ label, disabled, plus = false, onPress }: { label: string; disabled: boolean; plus?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress} style={[s.stepTarget, disabled && s.stepDisabled]}>
    <View style={s.stepCircle}>
      <View style={s.minus} />{plus && <View style={[s.minus, s.plus]} />}
    </View>
  </Pressable>;
}

const s = StyleSheet.create({
  content: { paddingTop: 4, gap: 14 },
  compactContent: { padding: 12, paddingHorizontal: 16, gap: 10, paddingBottom: 12 },
  populatedContent: { paddingTop: 4, paddingBottom: 8, gap: 10 },
  compactPopulatedContent: { gap: 6 },
  compactHeader: { paddingTop: 8, paddingBottom: 4 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: "row", alignItems: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 24, lineHeight: 32, fontWeight: "700", color: theme.color.text },
  headerBalance: { width: 48 },
  imageSection: { borderWidth: 1, borderStyle: "dashed", borderColor: theme.color.controlBorder, borderRadius: 12, backgroundColor: theme.color.surfaceSoft, overflow: "hidden" },
  imagePrompt: { minHeight: 170, alignItems: "center", justifyContent: "flex-end", paddingTop: 10, paddingBottom: 10, paddingHorizontal: 8 },
  cameraBox: { width: 64, height: 64, alignItems: "center", justifyContent: "center" },
  camera: { width: 96, height: 96 },
  addTitle: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: theme.color.text, marginTop: 2 },
  imageCopy: { fontSize: 14, lineHeight: 20, color: theme.color.text, textAlign: "center", marginTop: 8, marginBottom: 6 },
  caption: { fontSize: 12, lineHeight: 16, color: theme.color.textSecondary },
  selectedImage: { padding: 6 },
  pictureFrame: { width: "100%", aspectRatio: 1.5, borderRadius: 10, overflow: "hidden" },
  picture: { position: "absolute", width: "100%", height: "100%" },
  changeTarget: { position: "absolute", right: 12, bottom: 10, minHeight: 48, justifyContent: "center" },
  changeFace: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, borderWidth: 1.5, borderColor: "#fff", backgroundColor: "#294C7899", paddingHorizontal: 12, paddingVertical: 8 },
  changeLabel: { fontSize: 14, lineHeight: 20, fontWeight: "600", color: "#fff" },
  cameraGlyph: { width: 18, height: 13, borderRadius: 3, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  cameraTop: { position: "absolute", width: 8, height: 3, top: -2, borderRadius: 1, backgroundColor: "#fff" },
  cameraLens: { width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: "#526F98" },
  card: { backgroundColor: theme.color.surface, borderRadius: 16, padding: 12, paddingVertical: 8, gap: 4, boxShadow: "0 4px 16px #3521740f" },
  populatedSizeCard: { gap: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { color: theme.color.primary, fontSize: 20, lineHeight: 28, fontWeight: "700" },
  steppers: { flexDirection: "row", gap: 28 },
  stepColumn: { flex: 1 },
  label: { color: theme.color.text, fontSize: 14, lineHeight: 20, fontWeight: "700" },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 999, borderWidth: 1, borderColor: theme.color.border },
  stepTarget: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  stepCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.color.surfaceSoft, alignItems: "center", justifyContent: "center" },
  minus: { width: 16, height: 3, borderRadius: 2, backgroundColor: theme.color.primary },
  plus: { position: "absolute", transform: [{ rotate: "90deg" }] },
  stepDisabled: { opacity: 0.4 },
  value: { fontSize: 22, lineHeight: 28, fontWeight: "700", color: theme.color.text, fontVariant: ["tabular-nums"] },
  divider: { height: 1, backgroundColor: theme.color.border, marginTop: 2 },
  quickHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  presets: { flexDirection: "row", gap: 6 },
  preset: { flex: 1, minHeight: 60, paddingVertical: 9, alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 8, backgroundColor: theme.color.surfaceSoft, borderWidth: 1, borderColor: "transparent" },
  presetSelected: { backgroundColor: theme.color.selected, borderColor: theme.color.primary },
  populatedPreset: { minHeight: 48, paddingVertical: 3, gap: 2 },
  presetTick: { position: "absolute", top: 0, right: 3, fontSize: 10, color: theme.color.primary },
  presetGrid: { fontSize: 16, lineHeight: 22, fontWeight: "700", color: theme.color.text },
  presetCount: { fontSize: 12, lineHeight: 16, color: theme.color.textSecondary },
  timerCard: { paddingVertical: 4, gap: 0 },
  segmentTrack: { flexDirection: "row" },
  segmentBackdrop: { position: "absolute", top: 6, bottom: 6, left: 0, right: 0, backgroundColor: theme.color.surfaceSoft, borderRadius: 999 },
  segment: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 999 },
  segmentFace: { width: "100%", minHeight: 36, paddingVertical: 4, paddingHorizontal: 4, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  segmentSelected: { backgroundColor: theme.color.primary },
  segmentLabel: { fontSize: 14, lineHeight: 20, fontWeight: "700", color: theme.color.primary },
  segmentLabelSelected: { color: theme.color.surface },
  rotation: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  rotationCopy: { flex: 1, gap: 2 },
  switchTarget: { minWidth: 48, minHeight: 48, justifyContent: "center", alignItems: "center" },
  // Exact geometry/off fill from design/system/system.css .switch-row input.
  switchTrack: { width: 48, height: 28, borderRadius: 999, borderWidth: 2, borderColor: theme.color.controlBorder, backgroundColor: "#B7B2C9" },
  switchOn: { backgroundColor: theme.color.primary, borderColor: theme.color.primary },
  switchThumb: { position: "absolute", top: 2, left: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: theme.color.surface, boxShadow: "0 1px 3px #17124f30" },
  switchThumbOn: { left: 22 },
  readyOuter: { padding: 4, backgroundColor: theme.color.surface, borderRadius: 16 },
  ready: { flexDirection: "row", alignItems: "center", gap: 14, padding: 6, borderRadius: 12, backgroundColor: theme.color.surfaceSoft },
  readyCopy: { flex: 1, gap: 4 },
  readyTitle: { fontSize: 18, lineHeight: 24, fontWeight: "700", color: theme.color.text },
  readyBody: { fontSize: 14, lineHeight: 20, color: theme.color.textSecondary },
  footer: { gap: 8 },
  createDisabled: { minHeight: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", backgroundColor: theme.color.disabledSurface, padding: 12 },
  createLabel: { fontSize: 18, lineHeight: 24, fontWeight: "700", color: theme.color.disabledText },
  createPreview: { backgroundColor: theme.color.primary },
  createPreviewLabel: { color: theme.color.surface },
  footerNote: { fontSize: 12, lineHeight: 16, textAlign: "center", color: theme.color.textSecondary },
});
