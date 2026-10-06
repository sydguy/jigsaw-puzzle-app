import { KeyboardEvent, useState } from "react";
import { Image, ImageSourcePropType, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { art } from "../assets";
import BackButton from "../components/BackButton";
import AppScrollView from "../components/AppScrollView";
import { useCreateReview } from "../create/review";
import { useSourceReviewNotice } from "./sourceReview";
import { useDevice } from "../preview/context";
import { theme } from "../theme";

type Picture = { id: string; title: string; image: ImageSourcePropType; owned: boolean };
type Collection = { id: string; title: string };
const pictures: Picture[] = __DEV__ && Platform.OS === "web" ? require("../preview/collectionPictureSeeds.web").collectionPictureSeeds : [];
const collections: Collection[] = __DEV__ && Platform.OS === "web" ? require("../preview/curatedSeeds.web").curatedSeeds : [];
const gradient = Platform.OS === "web" ? { backgroundImage: `linear-gradient(110deg, ${theme.color.gradientStart}, ${theme.color.gradientEnd})` } as ViewStyle : {};

export default function MobileCollectionPictures({ collectionId, returnTo, onBack }: { collectionId: string; returnTo?: string; onBack: () => void }) {
  const collection = collections.find(item => item.id === collectionId);
  const [selected, setSelected] = useState<string | null>(null);
  const [excludeOwned, setExcludeOwned] = useState(false);
  const review = useCreateReview();
  const notify = useSourceReviewNotice();
  const { width } = useDevice();
  const tileWidth = (width - 32 - 18 - 16) / 3;
  const selection = pictures.find(item => item.id === selected && !item.owned);
  const choose = () => {
    if (!selection || !review || !collection) return;
    if (returnTo !== "create") {
      notify(`${selection.title} selected for review. Saving curated pictures will be available when the catalogue service is connected.`);
      return;
    }
    review.setSelectedPicture({ title: selection.title, image: selection.image });
    review.setState("after");
    router.dismissTo("/create");
  };
  return <SafeAreaView style={s.screen} testID="collection-picture-screen">
    <View style={s.top} testID="collection-picture-header">
      <View style={s.titleRow}><BackButton onPress={onBack} /><Text accessibilityRole="header" style={s.title}>{collection?.title ?? "Collection unavailable"}</Text><View style={{ width: 48 }} /></View>
      <Text style={s.subtitle}>Choose a picture to add to your puzzle.</Text>
      <View style={s.allowance} testID="collection-picture-allowance">
        <Image source={art.crown} accessible={false} resizeMode="contain" style={s.crown} />
        <View style={s.allowanceText}><Text style={s.allowanceTitle}>Theme Collection</Text>
          <View accessibilityLabel="Sample: 75 of 100 pictures used; 2 of 3 themes used" style={s.balanceRow}>
            <Text style={s.balance}>75/100 <Text style={s.unit}>pictures</Text></Text><Text style={s.balance}>2/3 <Text style={s.unit}>themes</Text></Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Buy Theme Packs" onPress={() => notify("Theme-pack purchases are not connected. No purchase or balance change was made.")} style={s.buyTarget}>
          <View style={[s.buyFace, gradient]}><Text style={s.buyLabel}>Buy Theme Packs</Text></View>
        </Pressable>
      </View>
      <Pressable accessibilityRole="switch" accessibilityLabel="Exclude already in collection" accessibilityState={{ checked: excludeOwned }} aria-checked={excludeOwned}
        {...(Platform.OS === "web" ? { onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === " ") { event.preventDefault(); setExcludeOwned(value => !value); }
        } } : {})}
        onPress={() => setExcludeOwned(value => !value)} style={s.filter}>
        <Text style={s.filterText}>Exclude already in collection</Text>
        <View style={[s.switchTrack, excludeOwned && s.switchOn]}><View style={[s.switchThumb, excludeOwned && s.thumbOn]} /></View>
      </Pressable>
    </View>
    <View style={s.boundary} testID="collection-picture-boundary">
      <AppScrollView scrollbarTopInset={0} scrollbarBottomInset={0} contentContainerStyle={s.grid}>
        {collection ? pictures.filter(item => !excludeOwned || !item.owned).map(item => <Pressable key={item.id} testID={`collection-picture-${item.id}`}
          accessibilityRole="button" accessibilityLabel={`${item.title}${item.owned ? ", already in collection" : ""}`} accessibilityState={{ selected: item.id === selected, disabled: item.owned }} aria-pressed={item.id === selected}
          disabled={item.owned} onPress={() => setSelected(current => current === item.id ? null : item.id)} style={[s.tile, { width: tileWidth, height: tileWidth / 1.2 }, selected === item.id && s.selected]}>
          <Image source={item.image} accessible={false} resizeMode="cover" style={s.picture} />
          {item.owned && <View style={s.owned}><Text style={s.ownedText}>Already in{"\n"}collection</Text></View>}
          {item.id === selected && <View style={s.tickCircle} accessible={false}><View style={s.tick} /></View>}
        </Pressable>) : <Text style={s.subtitle}>This collection is not available in the preview.</Text>}
      </AppScrollView>
    </View>
    <View style={s.footer} testID="collection-picture-footer">
      <Pressable accessibilityRole="button" accessibilityLabel="Add Picture" accessibilityState={{ disabled: !selection }} disabled={!selection} onPress={choose}
        style={[s.add, gradient, !selection && s.disabled]}>
        <View accessible={false} style={s.photoIcon}><View style={s.sun} /><View style={s.mountain} /></View>
        <Text style={s.addText}>Add Picture</Text>
      </Pressable>
    </View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, backgroundColor: theme.color.canvas },
  top: { paddingHorizontal: 16, paddingTop: 12, flexShrink: 0 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1, fontSize: 24, lineHeight: 32, fontWeight: "700", textAlign: "center", color: theme.color.text },
  subtitle: { fontSize: 14, lineHeight: 20, color: theme.color.textSecondary, textAlign: "center" },
  allowance: { marginTop: 16, minHeight: 56, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: theme.color.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.color.border, boxShadow: "0 2px 8px #35217414" },
  crown: { width: 38, height: 38, tintColor: "#E69A2D" },
  allowanceText: { flex: 1, minWidth: 0, gap: 2 },
  allowanceTitle: { fontSize: 16, lineHeight: 20, fontWeight: "700", color: theme.color.text },
  balanceRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  balance: { fontSize: 14, lineHeight: 18, fontWeight: "700", color: theme.color.primary },
  unit: { fontSize: 10, fontWeight: "400", color: theme.color.textSecondary },
  buyTarget: { width: 108, minHeight: 48, justifyContent: "center" },
  buyFace: { minHeight: 32, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 6, backgroundColor: theme.color.primary, alignItems: "center", justifyContent: "center" },
  buyLabel: { fontSize: 11, lineHeight: 16, color: theme.color.surface },
  filter: { minHeight: 56, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "flex-end" },
  filterText: { fontSize: 14, lineHeight: 20, color: theme.color.text },
  switchTrack: { width: 48, height: 28, borderRadius: 999, borderWidth: 2, borderColor: theme.color.controlBorder, backgroundColor: "#B7B2C9" },
  switchOn: { backgroundColor: theme.color.primary, borderColor: theme.color.primary },
  switchThumb: { position: "absolute", top: 2, left: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: theme.color.surface, boxShadow: "0 1px 3px #17124f30" },
  thumbOn: { left: 22 },
  boundary: { flex: 1, minHeight: 0, marginHorizontal: 16, overflow: "hidden" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingRight: 18, paddingBottom: 4 },
  tile: { borderRadius: 10, overflow: "hidden", borderWidth: 2, borderColor: "transparent", padding: 1 },
  selected: { borderColor: theme.color.primary },
  picture: { width: "100%", height: "100%", borderRadius: 7 },
  owned: { ...StyleSheet.absoluteFillObject, backgroundColor: "#101B33A6", alignItems: "center", justifyContent: "center" },
  ownedText: { color: "#fff", fontSize: 13, lineHeight: 17, fontWeight: "700", textAlign: "center" },
  tickCircle: { position: "absolute", bottom: 4, right: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  tick: { width: 14, height: 8, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: theme.color.primary, transform: [{ rotate: "-45deg" }], marginTop: -3 },
  footer: { padding: 16, paddingTop: 12, flexShrink: 0 },
  add: { minHeight: 56, padding: 12, borderRadius: 12, backgroundColor: theme.color.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 },
  disabled: { opacity: 0.5 },
  addText: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: "#fff" },
  photoIcon: { width: 24, height: 25, borderRadius: 4, borderWidth: 2, borderColor: "#fff", overflow: "hidden" },
  sun: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff", top: 3, left: 4 },
  mountain: { width: 16, height: 16, backgroundColor: "#fff", transform: [{ rotate: "45deg" }], top: 9, left: 2 },
});
