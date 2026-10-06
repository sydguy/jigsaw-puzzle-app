import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { art } from "../assets";
import { Notice, Screen } from "../components/ui";
import PreferenceSwitch from "../components/PreferenceSwitch";
import { theme } from "../theme";
import { useSettingsReview } from "./review";
import SettingsPageHeader from "./SettingsPageHeader";

const preferences = [
  { key: "functional", title: "Functional (Required)", description: "Essential app features — always on", image: art.functional },
  { key: "analytics", title: "Analytics", description: "Help us improve the app", image: art.analytics },
  { key: "marketing", title: "Marketing", description: "Personalised recommendations", image: art.marketing },
] as const;
const policies = [
  { title: "Terms & Conditions", description: "View full terms of use", image: art.terms },
  { title: "Privacy Policy", description: "How we handle your data", image: art.privacyPolicy },
  { title: "Cookie Policy", description: "Detailed cookie information", image: art.cookiePolicy },
] as const;

export default function MobileLegal({ onBack }: { onBack: () => void }) {
  const review = useSettingsReview();
  const [message, setMessage] = useState("");
  const notify = (text: string) => review ? review.notify(text) : setMessage(text);
  return <Screen fixedContent={<SettingsPageHeader title="Privacy and Legal" subtitle="Manage your legal preferences, policies, and data settings" onBack={onBack} />} contentStyle={s.content}>
    <View style={s.card} testID="mobile-cookie-preferences">
      <Text accessibilityRole="header" style={s.heading}>Cookie Preferences</Text>
      {preferences.map((item, index) => <View key={item.key} style={s.row}>
        <Image accessible={false} source={item.image} resizeMode="contain" style={s.art} />
        <View style={s.copy}><Text style={s.title}>{item.title}</Text><Text style={s.description}>{item.description}</Text></View>
        {item.key === "functional" ? <View accessible accessibilityLabel="Functional preferences: always on" style={s.requiredTarget}><View style={s.requiredTrack}><View style={s.requiredThumb} /></View></View> :
          <PreferenceSwitch label={item.title} value={review?.privacy[item.key] ?? false} disabled={!review} onChange={value => {
            if (!review) return;
            review.setPrivacy({ ...review.privacy, [item.key]: value });
            notify(`${item.title} ${value ? "on" : "off"} in this preview only. No analytics or marketing service is connected, and no tracking was started.`);
          }} />}
        {index < preferences.length - 1 && <View style={s.divider} />}
      </View>)}
    </View>
    <View style={s.card} testID="mobile-legal-links">
      <Text accessibilityRole="header" style={s.heading}>Legal</Text>
      {policies.map((item, index) => <Pressable key={item.title} accessibilityRole="button" accessibilityLabel={item.title} onPress={() => notify(`${item.title} is not published yet. The final policy is awaiting review; no external page was opened.`)} style={({ pressed }) => [s.row, pressed && s.pressed]}>
        <Image accessible={false} source={item.image} resizeMode="contain" style={s.art} />
        <View style={s.copy}><Text style={s.title}>{item.title}</Text><Text style={s.description}>{item.description}</Text></View>
        <View style={s.chevronTarget} accessible={false}><View style={s.chevron} /></View>
        {index < policies.length - 1 && <View style={s.divider} />}
      </Pressable>)}
    </View>
    {!!message && <Notice>{message}</Notice>}
  </Screen>;
}
const s = StyleSheet.create({
  content: { paddingTop: 4, paddingHorizontal: 16, gap: 14 },
  card: { padding: 14, paddingBottom: 6, backgroundColor: theme.color.surface, borderRadius: 16, boxShadow: "0 3px 10px #3521740d" },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: theme.color.text, marginBottom: 6 },
  row: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  art: { width: 44, height: 44, flexShrink: 0 },
  copy: { flex: 1, gap: 4, minWidth: 0 },
  title: { fontSize: 15, lineHeight: 21, fontWeight: "700", color: theme.color.text },
  description: { fontSize: 13, lineHeight: 18, color: theme.color.textSecondary },
  divider: { position: "absolute", left: 56, right: 0, bottom: 0, height: 1, backgroundColor: theme.color.selected },
  requiredTarget: { width: 48, minHeight: 48, justifyContent: "center" },
  requiredTrack: { width: 48, height: 28, borderRadius: 14, backgroundColor: theme.color.primary },
  requiredThumb: { position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: theme.color.surface },
  chevronTarget: { width: 20, alignItems: "center", justifyContent: "center" },
  chevron: { width: 9, height: 9, borderRightWidth: 2, borderTopWidth: 2, borderColor: theme.color.primary, transform: [{ rotate: "45deg" }] },
  pressed: { backgroundColor: theme.color.surfaceSoft },
});
