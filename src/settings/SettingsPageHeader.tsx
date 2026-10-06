import { StyleSheet, Text, View } from "react-native";
import BackButton from "../components/BackButton";
import { theme } from "../theme";

export default function SettingsPageHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return <View style={s.header}>
    <BackButton onPress={onBack} />
    <View style={s.copy}><Text accessibilityRole="header" style={s.title}>{title}</Text><Text style={s.subtitle}>{subtitle}</Text></View>
  </View>;
}
const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  copy: { flex: 1, gap: 4, paddingTop: 4 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: "700", color: theme.color.text },
  subtitle: { fontSize: 13, lineHeight: 19, color: theme.color.primary },
});
