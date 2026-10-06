import { ImageSourcePropType, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Action, Art, Notice, Screen } from "../components/ui";
import PreferenceSwitch from "../components/PreferenceSwitch";
import { theme } from "../theme";
import { Preferences } from "../local/types";
import { useSettingsReview } from "./review";
import { useDevice } from "../preview/context";

const signInGradient = Platform.OS === "web" ? { backgroundImage: `linear-gradient(110deg, ${theme.color.gradientStart}, ${theme.color.gradientEnd})` } as ViewStyle : {};

export default function MobileSettings({ sections, onSection, preferences, disabled, onPreference, error, retry }: {
  sections: readonly { key: string; label: string; art: ImageSourcePropType }[];
  onSection: (key: string) => void; preferences: Preferences; disabled: boolean;
  onPreference: (key: keyof Preferences, value: boolean) => void; error: string; retry: () => void;
}) {
  const review = useSettingsReview();
  const signedIn = review?.signedIn ?? false;
  const { height } = useDevice();
  return <Screen tab="Settings" floatingTabs contentStyle={s.content}>
    <View style={[s.panel, { minHeight: Math.max(0, height - 102) }]} testID="mobile-settings-panel">
      <View style={s.profile}>
        <View style={s.avatar} accessible={false}><Text style={s.initial}>{signedIn ? "S" : "G"}</Text></View>
        <View style={s.profileCopy}><Text accessibilityRole="header" style={s.name}>{signedIn ? "Sarah Johnson" : "Playing as a guest"}</Text><Text style={s.caption}>{signedIn ? "sarah@example.com" : "Your collection stays on this device."}</Text></View>
      </View>
      <Text accessibilityRole="header" style={s.sectionTitle}>Settings</Text>
      <View style={s.links}>
        {sections.map(item => <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => onSection(item.key)} style={({ pressed }) => [s.link, pressed && { backgroundColor: theme.color.selected }]}>
          <Art source={item.art} size={38} /><Text style={s.linkText}>{item.label}</Text><View style={s.chevron} accessible={false} />
        </Pressable>)}
      </View>
      <View style={s.preferences} testID="settings-play-preferences">
        <Text accessibilityRole="header" style={s.preferenceTitle}>Play preferences</Text>
        {(["sound", "haptics"] as const).map(key => <View key={key} style={s.preferenceRow}>
          <Text style={s.preferenceLabel}>{key === "sound" ? "Sound effects" : "Haptic feedback"}</Text>
          <PreferenceSwitch label={key === "sound" ? "Sound effects" : "Haptic feedback"} value={preferences[key]} disabled={disabled} onChange={value => onPreference(key, value)} />
        </View>)}
        <Text style={s.preferenceCopy}>Saved on this device. Gameplay sound and haptics will be connected with play.</Text>
      </View>
      {!signedIn && <View style={s.accountActions} testID="settings-account-actions">
        <Pressable accessibilityRole="button" accessibilityLabel="Sign In" onPress={() => review ? review.notify("Sign-in services are not connected yet. Use Account review above to view the signed-in design.") : onSection("account")} style={[s.signIn, signInGradient]}><Text style={s.signInText}>Sign In</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign Up" onPress={() => review ? review.notify("Sign-up services are not connected yet. Your pictures remain saved on this device.") : onSection("account")} style={s.signUp}><Text style={s.caption}>New here?</Text><Text style={s.signUpText}>Sign up</Text></Pressable>
      </View>}
      {signedIn && <View style={s.signedInActions} testID="settings-account-actions"><Pressable accessibilityRole="button" accessibilityLabel="Sign Out" onPress={() => { review?.setSignedIn(false); review?.notify("Returned to the guest review. Your saved pictures and preferences are unchanged."); }} style={[s.signIn, s.signOut]}><Text accessible={false} style={s.signOutArrow}>←</Text><Text style={[s.signInText, { color: theme.color.primary }]}>Sign Out</Text></Pressable></View>}
      {!!error && <><Notice error>{error}</Notice><Action label="Retry loading" secondary onPress={retry} /></>}
    </View>
  </Screen>;
}
const s = StyleSheet.create({
  content: { paddingTop: 16, paddingRight: 16, paddingBottom: 0 },
  panel: { padding: 16, paddingBottom: 0, backgroundColor: theme.color.surface, borderRadius: 16, gap: 12, boxShadow: "0 4px 16px #3521740f" },
  profile: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 4, paddingBottom: 8 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.color.selected, alignItems: "center", justifyContent: "center" },
  initial: { fontSize: 34, lineHeight: 42, fontWeight: "500", color: theme.color.primary },
  profileCopy: { flex: 1, gap: 4 }, name: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: theme.color.text },
  caption: { fontSize: 13, lineHeight: 18, color: theme.color.textSecondary },
  sectionTitle: { paddingHorizontal: 6, fontSize: 15, lineHeight: 22, fontWeight: "700", color: theme.color.textSecondary },
  links: { flexGrow: 1 }, link: { flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 20, minHeight: 52, paddingHorizontal: 6, paddingVertical: 7, borderRadius: 12 },
  linkText: { flex: 1, fontSize: 20, lineHeight: 28, fontWeight: "600", color: theme.color.text },
  chevron: { width: 10, height: 10, borderRightWidth: 2, borderTopWidth: 2, borderColor: theme.color.primary, transform: [{ rotate: "45deg" }], marginRight: 6 },
  preferences: { borderWidth: 1, borderColor: theme.color.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 0 },
  preferenceTitle: { fontSize: 15, lineHeight: 22, fontWeight: "700", color: theme.color.text, marginBottom: 0 },
  preferenceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  preferenceLabel: { flex: 1, fontSize: 14, lineHeight: 20, color: theme.color.text },
  preferenceCopy: { fontSize: 13, lineHeight: 18, color: theme.color.textSecondary, marginTop: 4 },
  accountActions: { alignItems: "stretch" },
  // Match the guest footer's 50-point action plus 48-point prompt. Its visible
  // 20-point text leaves 14 points below; give Sign Out that same bottom inset.
  signedInActions: { paddingTop: 34, paddingBottom: 14 },
  signIn: { minHeight: 50, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: "transparent", borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.primary },
  signInText: { fontSize: 16, lineHeight: 24, fontWeight: "600", color: "#fff" },
  signOut: { flexDirection: "row", gap: 10, backgroundColor: theme.color.surface, borderColor: theme.color.controlBorder },
  signOutArrow: { fontSize: 22, lineHeight: 24, fontWeight: "600", color: theme.color.primary },
  signUp: { minHeight: 48, flexDirection: "row", gap: 4, alignItems: "center", justifyContent: "center" },
  signUpText: { fontSize: 14, lineHeight: 20, fontWeight: "600", color: theme.color.primary },
});
