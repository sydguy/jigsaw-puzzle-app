import { useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { router } from "expo-router";
import { art } from "../assets";
import { Empty, Screen } from "../components/ui";
import BackButton from "../components/BackButton";
import { StorageStatus } from "../components/StorageStatus";
import { useLocal } from "../local/store";
import { theme } from "../theme";
import { useDevice } from "../preview/context";
import { useCreateReview } from "../create/review";
import { CollectionItem, useCollectionReview } from "./review";
import CollectionMenu from "./CollectionMenu";
import SwipeDeleteRow from "../components/SwipeDeleteRow";

const gradient = Platform.OS === "web" ? { backgroundImage: `linear-gradient(110deg, ${theme.color.gradientStart}, ${theme.color.gradientEnd})` } as ViewStyle : {};
const sortOptions = ["Recently Added", "Last Used", "Most Used", "Title A–Z"];
const badgeColors: Record<string, { backgroundColor: string; color: string }> = {
  Animals: { backgroundColor: theme.color.successSoft, color: theme.color.success },
  Travel: { backgroundColor: theme.color.infoSoft, color: theme.color.info },
  Seasons: { backgroundColor: theme.color.warningSoft, color: theme.color.warning },
};
const date = (value: number | null) => value === null ? "Not yet" : new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).replace("Sept", "Sep");

export default function MobileCollection({ selecting = false }: { selecting?: boolean }) {
  const local = useLocal(), review = useCollectionReview(), createReview = useCreateReview();
  const { width } = useDevice();
  const [detailed, setDetailed] = useState(false), [sort, setSort] = useState("Recently Added"), [filter, setFilter] = useState("All pictures");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openRow, setOpenRow] = useState<string | null>(null), [deletedSamples, setDeletedSamples] = useState<string[]>([]);
  const all: CollectionItem[] = [...local.pictures.map(p => ({ id: p.id, title: p.title, image: { uri: p.data }, theme: "My Pictures", addedAt: p.addedAt, lastUsed: null, timesUsed: 0, sample: false })), ...(review?.items ?? [])];
  const themes = ["All pictures", "My Pictures", "All Curated Themes", ...new Set(all.filter(p => p.sample).map(p => p.theme))];
  const activeFilter = themes.includes(filter) ? filter : "All pictures";
  const items = all.filter(p => !deletedSamples.includes(p.id) && (activeFilter === "All pictures" || (activeFilter === "All Curated Themes" ? p.theme !== "My Pictures" : p.theme === activeFilter))).sort((a, b) => sort === "Last Used" ? (b.lastUsed ?? 0) - (a.lastUsed ?? 0) : sort === "Most Used" ? b.timesUsed - a.timesUsed : sort === "Title A–Z" ? a.title.localeCompare(b.title) : b.addedAt - a.addedAt);
  const selected = items.find(item => item.id === selectedId);
  const tileWidth = (width - 16 - 24 - 16) / 3;
  const start = () => {
    if (!selected) return;
    createReview?.setHomePuzzle(null);
    createReview?.notify("");
    if (selected.sample) { createReview?.setSelectedPicture({ title: selected.title, image: selected.image }); createReview?.setState("after"); }
    else { createReview?.setSelectedPicture(null); local.setDraft(value => ({ ...value, pictureId: selected.id })); }
    router.push("/create");
  };
  const remove = async (item: CollectionItem) => {
    if (item.sample) setDeletedSamples(current => [...current, item.id]);
    else {
      const picture = local.pictures.find(p => p.id === item.id);
      if (!picture) throw new Error("This picture is no longer available. Reload the collection.");
      await local.remove(picture);
    }
    if (createReview?.selectedPicture?.title === item.title) createReview.setSelectedPicture(null);
    setSelectedId(current => current === item.id ? null : current); setOpenRow(null);
  };
  return <Screen tab={selecting ? undefined : "My Collection"} contentStyle={s.content}
    fixedContent={<View style={s.top} testID="my-collection-header">
      <View style={s.titleRow}>{selecting && <BackButton onPress={() => router.replace("/create")} />}<Text accessibilityRole="header" style={s.title}>{selecting ? "Choose a picture" : "My Collection"}</Text>{selecting && <View style={{ width: 48 }} />}</View>
      <Text style={s.subtitle}>Your photos and images</Text>
      <View style={s.filters}><CollectionMenu label="Sort by" value={sort} options={sortOptions} onChange={setSort} /><CollectionMenu label="Filter by Theme" value={activeFilter} options={themes} onChange={setFilter} /></View>
      <View style={s.segments}>
        {[false, true].map(detail => <Pressable key={String(detail)} accessibilityRole="button" accessibilityLabel={detail ? "Detailed" : "Grid"} aria-pressed={detailed === detail} onPress={() => setDetailed(detail)} style={s.segmentTarget}>
          <View testID="collection-view-face" style={[s.segment, detailed === detail && gradient, detailed === detail && s.segmentSelected]}>
          <View style={detail ? s.listIcon : s.gridIcon}>{Array.from({ length: detail ? 3 : 4 }, (_, i) => <View key={i} style={[detail ? s.listLine : s.gridSquare, { backgroundColor: detailed === detail ? "#fff" : theme.color.textSecondary }]} />)}</View>
          <Text style={[s.segmentText, detailed === detail && { color: "#fff" }]}>{detail ? "Detailed" : "Grid"}</Text>
          </View>
        </Pressable>)}
      </View>
    </View>}
    fixedFooter={<View style={s.footer} testID="my-collection-footer">
      <Pressable accessibilityRole="button" accessibilityLabel="Create Puzzle" disabled={!selected} accessibilityState={{ disabled: !selected }} onPress={start} style={[s.create, selected ? gradient : s.disabled]}>
        <Image accessible={false} source={art.piece} resizeMode="contain" style={{ width: 28, height: 28, tintColor: selected ? "#fff" : theme.color.disabledText }} /><Text style={[s.createText, !selected && { color: theme.color.disabledText }]}>Create Puzzle</Text>
      </Pressable>
    </View>}>
    <StorageStatus />
    {!items.length && !local.loading && !local.error && <Empty title={activeFilter === "My Pictures" || activeFilter === "All pictures" ? "Make it your collection" : "No matching pictures"} description="Add a picture once and use it for as many puzzles as you like." source={art.gallery} action={{ label: "Add Picture", onPress: () => router.push(`/sources?returnTo=${selecting ? "create" : "collection"}`) }} />}
    <View style={[s.items, detailed && s.details]} testID="collection-grid">
      {items.map(item => detailed ? <SwipeDeleteRow key={item.id} title={item.title} open={openRow === item.id} onOpenChange={open => setOpenRow(open ? item.id : null)} objectLabel="picture"
        description={item.sample ? "Remove this sample picture from the collection preview?" : "This permanently removes the picture from this device. There are 0 linked puzzles; gameplay is not connected yet."}
        note={item.sample ? "Preview only. Your saved photos and purchased content are unchanged." : "This cannot be undone."} onDelete={() => remove(item)}>
        <DetailRow item={item} selected={item.id === selectedId} onPress={() => setSelectedId(current => current === item.id ? null : item.id)} />
      </SwipeDeleteRow> : <Pressable key={item.id} testID="my-collection-item" accessibilityRole="button" accessibilityLabel={`Select ${item.title}`} aria-pressed={item.id === selectedId} onPress={() => setSelectedId(current => current === item.id ? null : item.id)}
        style={[s.gridItem, { width: tileWidth }]}>
        <View style={[s.imageFrame, { width: "100%", aspectRatio: 1.5 }, item.id === selectedId && s.selected]}>
          <Image source={item.image} accessibilityLabel={item.title} resizeMode="contain" style={s.image} />
          {item.id === selectedId && <Tick />}
        </View>
        <View style={s.gridCopy}>
          <View style={s.nameRow}><Text numberOfLines={1} style={s.name}>{item.title}</Text></View>
          <View style={[s.badge, { backgroundColor: badgeColors[item.theme]?.backgroundColor ?? theme.color.selected }]}><Text style={[s.badgeText, { color: badgeColors[item.theme]?.color ?? theme.color.primary }]}>{item.theme}</Text></View>
        </View>
      </Pressable>)}
    </View>
  </Screen>;
}
function Tick() { return <View style={s.tick} accessible={false}><View style={[s.check, { borderColor: theme.color.primary }]} /></View>; }
function DetailRow({ item, selected, onPress }: { item: CollectionItem; selected: boolean; onPress: () => void }) {
  const { width } = useDevice();
  const imageHeight = Math.round((width - 40) / 3) / 1.5;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Select ${item.title}`} aria-pressed={selected} testID="my-collection-item" onPress={onPress} style={[s.detail, selected && s.selected]}>
    <View style={[s.imageFrame, s.detailImage, { width: imageHeight * 1.5, height: imageHeight }]}><Image source={item.image} accessibilityLabel={item.title} resizeMode="contain" style={s.image} /></View>
    <View style={s.detailCopy}>
      <View style={s.nameRow}><Text numberOfLines={1} ellipsizeMode="tail" style={[s.name, s.detailName]}>{item.title}</Text><View style={[s.radio, selected && s.radioOn]}>{selected && <View style={s.check} />}</View></View>
      <View style={[s.badge, { backgroundColor: badgeColors[item.theme]?.backgroundColor ?? theme.color.selected }]}><Text style={[s.badgeText, { color: badgeColors[item.theme]?.color ?? theme.color.primary }]}>{item.theme}</Text></View>
      <View style={s.stats}><Text style={s.stat}>Times Used: {item.timesUsed}</Text><Text style={s.stat}>Date Added: {date(item.addedAt)}</Text><Text style={s.stat}>Last Used: {date(item.lastUsed)}</Text></View>
    </View>
  </Pressable>;
}
const s = StyleSheet.create({
  top: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 24, lineHeight: 32, fontWeight: "700", color: theme.color.text },
  subtitle: { textAlign: "center", fontSize: 14, lineHeight: 20, color: theme.color.textSecondary },
  filters: { flexDirection: "row", gap: 16, marginTop: 16, zIndex: 5 },
  segments: { flexDirection: "row", borderRadius: 8, marginTop: 4 },
  segmentTarget: { flex: 1, minHeight: 48, paddingVertical: 6, justifyContent: "center" },
  segment: { width: "100%", minHeight: 36, paddingVertical: 8, borderRadius: 8, flexDirection: "row", gap: 12, justifyContent: "center", alignItems: "center", backgroundColor: theme.color.surfaceSoft },
  segmentSelected: { backgroundColor: theme.color.primary },
  segmentText: { fontSize: 14, lineHeight: 20, fontWeight: "600", color: theme.color.textSecondary },
  gridIcon: { width: 18, height: 18, flexDirection: "row", flexWrap: "wrap", gap: 2 },
  gridSquare: { width: 8, height: 8, borderRadius: 2 },
  listIcon: { width: 20, gap: 3 }, listLine: { height: 3, width: 20, borderRadius: 1 },
  content: { padding: 0, paddingLeft: 16, paddingRight: 24, paddingBottom: 4, gap: 8 },
  items: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, details: { flexDirection: "column", flexWrap: "nowrap" },
  gridItem: { gap: 2 }, gridCopy: { paddingHorizontal: 3, gap: 3 },
  imageFrame: { borderRadius: 10, padding: 2, borderWidth: 2, borderColor: "transparent", backgroundColor: theme.color.surface, overflow: "hidden" },
  image: { width: "100%", height: "100%", borderRadius: 6 }, selected: { borderColor: theme.color.primary },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  name: { flex: 1, fontSize: 12, lineHeight: 16, fontWeight: "700", color: theme.color.text },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }, badgeText: { fontSize: 11, lineHeight: 14 },
  detail: { flexDirection: "row", gap: 8, padding: 6, borderRadius: 10, borderWidth: 1.5, borderColor: "transparent", backgroundColor: theme.color.surface, alignItems: "center", width: "100%" },
  detailImage: { padding: 0, borderWidth: 0, flexShrink: 0 }, detailCopy: { flex: 1, minWidth: 0, gap: 4 }, detailName: { fontSize: 15, lineHeight: 20 },
  stats: { flexDirection: "row", flexWrap: "wrap", columnGap: 8, rowGap: 1 }, stat: { fontSize: 10, lineHeight: 14, color: theme.color.textSecondary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: theme.color.controlBorder, alignItems: "center", justifyContent: "center" }, radioOn: { borderColor: theme.color.primary, backgroundColor: theme.color.primary },
  tick: { position: "absolute", right: 3, bottom: 3, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: theme.color.primary, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  check: { width: 11, height: 6, borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: "#fff", transform: [{ rotate: "-45deg" }], marginTop: -2 },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, gap: 4 },
  create: { minHeight: 48, padding: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: theme.color.primary },
  createText: { fontSize: 18, lineHeight: 24, fontWeight: "600", color: "#fff" }, disabled: { backgroundColor: theme.color.disabledSurface },
});
