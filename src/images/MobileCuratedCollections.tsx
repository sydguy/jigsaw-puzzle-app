import { ReactNode, useCallback, useContext } from "react";
import { Image, ImageSourcePropType, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { art } from "../assets";
import { Art, Notice } from "../components/ui";
import AppScrollView from "../components/AppScrollView";
import { TabVisibility } from "../navigation/visibility";
import { theme } from "../theme";
import { useDevice } from "../preview/context";
import { useSourceReviewNotice } from "./sourceReview";

type Collection = { id: string; title: string; count: number; premium: boolean; image: ImageSourcePropType };
const samples: readonly Collection[] = __DEV__ && Platform.OS === "web" ? require("../preview/curatedSeeds.web").curatedSeeds : [];
const gradient = Platform.OS === "web" ? { backgroundImage: `linear-gradient(110deg, ${theme.color.gradientStart}, ${theme.color.gradientEnd})` } as ViewStyle : {};

export default function MobileCuratedCollections({ header, options }: { header: ReactNode; options: ReactNode }) {
  const hideTabs = useContext(TabVisibility);
  useFocusEffect(useCallback(() => { hideTabs(true); }, [hideTabs]));
  const notify = useSourceReviewNotice();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const openCollection = (id: string) => router.push({ pathname: "/collection-pictures", params: { collection: id, returnTo: returnTo === "create" ? "create" : "collection" } });
  const { width } = useDevice();
  const imageWidth = Math.round((width - 36) * 0.375);
  const buy = () => notify("Theme packs are not connected yet. This preview does not make purchases or unlock collections.");
  return <SafeAreaView style={s.screen}>
    <View style={s.fixedTop} testID="curated-fixed-top">{header}<View style={s.options}>{options}</View></View>
    <View style={s.catalogue}>
      <View style={s.heading} testID="curated-heading">
        <Text accessibilityRole="header" style={s.headingTitle}>Choose a collection</Text>
        <Text style={s.headingCopy}>Premium collections require a collection pack.</Text>
      </View>
      <View style={s.listBoundary} testID="curated-scroll-boundary">
        <AppScrollView scrollbarTopInset={0} scrollbarBottomInset={0} contentContainerStyle={s.list}>
          {samples.length ? samples.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={() => openCollection(item.id)} style={s.row} testID={`curated-card-${item.id}`}>
            <View style={{ width: imageWidth, height: imageWidth / 1.5, flexShrink: 0 }}>
              <Image source={item.image} accessibilityLabel={`${item.title} artwork`} resizeMode="contain" style={s.image} />
              {item.premium ? <Image source={art.collectionLockBadge} accessible={false} resizeMode="contain" style={s.lockBadge} />
                : <View style={s.freeBadge}><Text style={s.freeBadgeText}>Free</Text></View>}
            </View>
            <View style={s.metadata}><Text style={s.name}>{item.title}</Text><Text style={s.count}>{item.count} images</Text></View>
            <View style={s.access} testID={`curated-access-${item.id}`}>
              <View style={[s.accessFace, item.premium ? s.premium : s.free]}>
                {item.premium && <Image source={art.collectionLock} accessible={false} resizeMode="contain" style={s.lockIcon} />}
                <Text style={[s.accessLabel, { color: item.premium ? theme.color.primary : theme.color.freeAccessText }]}>{item.premium ? "Premium" : "Free"}</Text>
              </View>
            </View>
          </Pressable>) : <Notice>The curated catalogue is being prepared. Choose Photo Gallery or Camera to add your own picture.</Notice>}
        </AppScrollView>
      </View>
    </View>
    <View style={s.shop} testID="curated-shop">
      <Art source={art.collectionShop} size={40} />
      <View style={s.shopCopy}><Text style={s.shopTitle}>Want more collections?</Text><Text style={s.shopBody}>Unlock premium themes by purchasing collection packs.</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Buy Theme Packs" accessibilityState={{ disabled: !samples.length }} disabled={!samples.length} onPress={buy} style={[s.buy, !samples.length && { opacity: 0.5 }]}>
        <View style={[s.buyFace, gradient]}><Text style={s.buyLabel}>Buy Theme Packs</Text><Text accessible={false} style={s.buyArrow}>→</Text></View>
      </Pressable>
    </View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, backgroundColor: theme.color.canvas },
  fixedTop: { flexShrink: 0 },
  options: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 22 },
  catalogue: { flex: 1, minHeight: 0, marginLeft: 16, marginRight: 4 },
  heading: { flexShrink: 0, marginRight: 18, marginBottom: 4, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 10, gap: 4, backgroundColor: theme.color.surface, borderRadius: 16 },
  headingTitle: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: theme.color.text },
  headingCopy: { fontSize: 12, lineHeight: 16, color: theme.color.textSecondary },
  listBoundary: { flex: 1, minHeight: 0, overflow: "hidden" },
  list: { paddingRight: 18, gap: 4, paddingBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 6, padding: 5, borderRadius: 10, borderWidth: 1, borderColor: theme.color.surfaceSoft, backgroundColor: theme.color.surface, boxShadow: "0 2px 6px #35217408" },
  image: { position: "absolute", width: "100%", height: "100%", borderRadius: 8 },
  lockBadge: { position: "absolute", top: 2, right: 2, width: 24, height: 24 },
  freeBadge: { position: "absolute", top: 4, left: 4, borderRadius: 999, backgroundColor: theme.color.freeAccessBadge, paddingHorizontal: 6, paddingVertical: 2 },
  freeBadgeText: { fontSize: 10, lineHeight: 14, color: theme.color.freeAccessBadgeText, fontWeight: "700" },
  metadata: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 12, lineHeight: 16, letterSpacing: -0.35, fontWeight: "700", color: theme.color.text },
  count: { fontSize: 11, lineHeight: 16, letterSpacing: -0.15, color: theme.color.textSecondary },
  access: { width: 88, minHeight: 48, alignItems: "center", justifyContent: "center" },
  accessFace: { width: "100%", minHeight: 32, paddingVertical: 3, paddingHorizontal: 4, flexDirection: "row", borderWidth: 1, borderRadius: 6, alignItems: "center", justifyContent: "center", gap: 4 },
  premium: { borderColor: theme.color.primary, backgroundColor: theme.color.surfaceSoft },
  free: { borderColor: theme.color.freeAccessBorder, backgroundColor: theme.color.freeAccessSurface },
  accessLabel: { fontSize: 11, lineHeight: 16, letterSpacing: -0.15, fontWeight: "700" },
  lockIcon: { width: 12, height: 16 },
  shop: { flexShrink: 0, margin: 16, marginTop: 20, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, backgroundColor: theme.color.surfaceSoft },
  shopCopy: { flex: 1, minWidth: 0, gap: 0 },
  shopTitle: { fontSize: 11, lineHeight: 15, letterSpacing: -0.25, fontWeight: "700", color: theme.color.text },
  shopBody: { fontSize: 10, lineHeight: 13, letterSpacing: -0.1, color: theme.color.textSecondary },
  buy: { width: "42%", minHeight: 48, alignItems: "center", justifyContent: "center" },
  buyFace: { width: "100%", minHeight: 34, paddingVertical: 5, paddingHorizontal: 5, borderRadius: 8, backgroundColor: theme.color.primary, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  buyLabel: { fontSize: 11.5, lineHeight: 16, letterSpacing: -0.2, fontWeight: "500", color: "#fff", textAlign: "center" },
  buyArrow: { fontSize: 18, lineHeight: 20, color: "#fff" },
});
