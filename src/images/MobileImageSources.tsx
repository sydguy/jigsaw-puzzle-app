import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { art } from "../assets";
import { Art, Screen } from "../components/ui";
import { StorageStatus } from "../components/StorageStatus";
import { theme } from "../theme";
import PhotoImport from "./PhotoImport";
import MobileCuratedCollections from "./MobileCuratedCollections";
import BackButton from "../components/BackButton";

const sources = [
  { id: "photo", title: "Photo Gallery", copy: "Choose from\nyour device", image: art.gallery },
  { id: "camera", title: "Camera", copy: "Take a new\npicture", image: art.camera },
  { id: "curated", title: "Curated Collections", copy: "Choose from\ncollections", image: art.curated },
] as const;

export default function MobileImageSources({ onBack, onAdded }: { onBack: () => void; onAdded: (id: string) => void }) {
  const [source, setSource] = useState<"photo" | "camera" | "curated">("photo");
  const header = (
    <View style={s.header}>
      <View style={s.titleRow}>
        <BackButton onPress={onBack} />
        <Text accessibilityRole="header" style={s.title}>Add Image</Text>
        <View style={{ width: 48 }} />
      </View>
      <Text style={s.subtitle}>Choose how you want to add your image</Text>
    </View>
  );
  const options = (
    <View style={s.sources} testID="mobile-image-sources">
      {sources.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.title}
        accessibilityState={{ selected: source === item.id }} aria-selected={source === item.id}
        onPress={() => setSource(item.id)} style={[s.source, source === item.id && s.selected]}>
        <Art source={item.image} size={64} />
        <Text style={s.sourceTitle}>{item.title}</Text>
        <Text style={s.sourceCopy}>{item.copy}</Text>
        {source === item.id && <View style={s.checkCircle} accessible={false}><View style={s.check} /></View>}
      </Pressable>)}
    </View>
  );
  if (source === "curated") return <MobileCuratedCollections header={header} options={options} />;
  return <Screen contentStyle={s.content} fixedContent={header}>
    {options}
    <StorageStatus />
    <PhotoImport key={source} mode={source} mobile onAdded={onAdded} />
    <View style={s.note}>
      <View style={s.info} accessible={false}><Text style={s.infoText}>i</Text></View>
      <Text style={s.noteText}>{source === "camera" ? "One picture at a time. Adding a picture does not upload it or start a puzzle." : "Adding a picture does not upload it or start a puzzle."}</Text>
    </View>
  </Screen>;
}

const s = StyleSheet.create({
  content: { padding: 16, paddingTop: 20, gap: 22 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 0, gap: 0 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1, fontSize: 24, lineHeight: 32, fontWeight: "700", textAlign: "center", color: theme.color.text },
  subtitle: { fontSize: 14, lineHeight: 20, textAlign: "center", color: theme.color.text },
  sources: { flexDirection: "row", gap: 8, alignItems: "stretch" },
  source: { flex: 1, paddingHorizontal: 4, paddingVertical: 8, alignItems: "center", borderWidth: 2, borderColor: "transparent", borderRadius: 12, backgroundColor: theme.color.surface, boxShadow: "0 4px 16px #3521740f" },
  selected: { borderColor: theme.color.primary, backgroundColor: theme.color.surfaceSoft },
  sourceTitle: { fontSize: 13, lineHeight: 18, marginBottom: 2, fontWeight: "700", color: theme.color.text, textAlign: "center" },
  sourceCopy: { fontSize: 13, lineHeight: 16, textAlign: "center", color: theme.color.textSecondary },
  checkCircle: { position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: theme.color.primary, alignItems: "center", justifyContent: "center" },
  check: { width: 10, height: 6, borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: "#fff", transform: [{ rotate: "-45deg" }], marginTop: -2 },
  note: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingHorizontal: 4 },
  info: { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.color.selected, alignItems: "center", justifyContent: "center" },
  infoText: { fontSize: 21, lineHeight: 26, fontFamily: "Georgia", fontWeight: "700", color: theme.color.primary },
  noteText: { flex: 1, fontSize: 14, lineHeight: 20, color: theme.color.textSecondary, paddingTop: 2 },
});
