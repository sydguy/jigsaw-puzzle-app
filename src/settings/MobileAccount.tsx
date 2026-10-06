import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Action, Notice, Screen } from "../components/ui";
import DeleteIcon from "../components/DeleteIcon";
import { theme } from "../theme";
import { useSettingsReview } from "./review";
import SettingsPageHeader from "./SettingsPageHeader";

export default function MobileAccount({ onBack }: { onBack: () => void }) {
  const review = useSettingsReview(), signedIn = review?.signedIn ?? false;
  const [fullName, setFullName] = useState(signedIn ? review!.profile.fullName : "");
  const [email, setEmail] = useState(signedIn ? review!.profile.email : "");
  const [error, setError] = useState("");
  useEffect(() => {
    setFullName(signedIn ? review!.profile.fullName : "");
    setEmail(signedIn ? review!.profile.email : "");
    setError("");
  }, [signedIn, review?.profile.fullName, review?.profile.email]);
  const save = () => {
    if (!signedIn || !review) return;
    if (!fullName.trim()) { setError("Enter your full name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    setError("");
    review.setProfile({ fullName: fullName.trim(), email: email.trim() });
    review.notify("Profile updated in this preview only. No account or email address was changed; reload resets the sample profile.");
  };
  return <Screen fixedContent={<SettingsPageHeader title="Account" subtitle="Manage your account, security, and preferences" onBack={onBack} />} contentStyle={s.content}>
    <View style={s.form} testID="mobile-account-form">
      {!signedIn && <Text style={s.guest}>Sign in to manage your account.</Text>}
      <View style={s.field}><Text style={s.label}>Full Name</Text><TextInput accessibilityLabel="Full Name" value={fullName} onChangeText={setFullName} editable={signedIn} maxLength={100} autoComplete="off" placeholder="Your full name" placeholderTextColor={theme.color.textSecondary} style={s.input} /></View>
      <View style={s.field}><Text style={s.label}>Email</Text><TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} editable={signedIn} maxLength={254} keyboardType="email-address" autoCapitalize="none" autoComplete="off" autoCorrect={false} placeholder="you@example.com" placeholderTextColor={theme.color.textSecondary} style={s.input} /></View>
      <View style={s.field}><Text style={s.label}>Password</Text><View style={s.password}>
        <Text accessibilityLabel={signedIn ? "Password hidden" : "Sign in required"} style={s.passwordMask}>{signedIn ? "••••••••••" : "—"}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit password" disabled={!signedIn} onPress={() => review?.notify("Password changes require a connected account and verification. No password was requested or changed.")} style={[s.edit, !signedIn && s.inactive]}><Text accessible={false} style={s.pencil}>✎</Text><Text style={s.editText}>Edit</Text></Pressable>
      </View></View>
      {!!error && <Notice error>{error}</Notice>}
      <Action label="Save Changes" disabled={!signedIn} onPress={save} />
    </View>
    <View style={s.danger} testID="account-danger-zone">
      <View style={s.dangerHeading}>
        <View accessible={false} style={s.warning}><View style={s.triangle} /><Text style={s.exclamation}>!</Text></View>
        <View style={s.dangerCopy}><Text accessibilityRole="header" style={s.dangerTitle}>Danger Zone</Text><Text style={s.dangerDescription}>Deleting your account permanently removes its profile, pictures and puzzles. Other devices remove account data when they reconnect. Guest pictures stay separate. This cannot be undone.</Text></View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Delete My Account" disabled={!signedIn} onPress={() => review?.notify("Account deletion is not connected. A real deletion will require identity verification. No account, picture or puzzle was deleted.")} style={[s.delete, !signedIn && s.inactive]}><DeleteIcon color={theme.color.cardDelete} /><Text style={s.deleteText}>Delete My Account</Text></Pressable>
    </View>
  </Screen>;
}
const s = StyleSheet.create({
  content: { paddingTop: 4, paddingHorizontal: 16, gap: 32 },
  form: { backgroundColor: theme.color.surface, borderRadius: 16, padding: 12, gap: 14, boxShadow: "0 3px 10px #35217412" },
  guest: { color: theme.color.textSecondary, fontSize: 13, lineHeight: 19 },
  field: { gap: 6 }, label: { fontSize: 14, lineHeight: 20, fontWeight: "700", color: theme.color.primary },
  input: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: theme.color.border, borderRadius: 8, fontSize: 16, lineHeight: 24, color: theme.color.text, backgroundColor: theme.color.canvas },
  password: { minHeight: 48, paddingLeft: 12, borderWidth: 1, borderColor: theme.color.border, borderRadius: 8, flexDirection: "row", alignItems: "center", backgroundColor: theme.color.canvas },
  passwordMask: { flex: 1, fontSize: 18, letterSpacing: 2, color: theme.color.text },
  edit: { minHeight: 48, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  pencil: { fontSize: 24, lineHeight: 28, color: theme.color.primary }, editText: { fontSize: 14, lineHeight: 20, color: theme.color.primary },
  inactive: { opacity: 0.5 },
  danger: { borderRadius: 12, borderWidth: 1, borderColor: "#FFD4D8", backgroundColor: theme.color.dangerSoft, padding: 12, gap: 14 },
  dangerHeading: { flexDirection: "row", alignItems: "flex-start", gap: 12 }, dangerCopy: { flex: 1, gap: 6 },
  dangerTitle: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: theme.color.danger },
  dangerDescription: { fontSize: 13, lineHeight: 19, color: theme.color.danger },
  warning: { width: 32, height: 32, alignItems: "center", justifyContent: "center", marginTop: 2 },
  triangle: { position: "absolute", borderLeftWidth: 16, borderRightWidth: 16, borderBottomWidth: 29, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: theme.color.cardDelete },
  exclamation: { color: "#fff", fontSize: 21, lineHeight: 26, fontWeight: "700", marginTop: 8 },
  delete: { minHeight: 48, borderWidth: 1, borderColor: theme.color.cardDelete, borderRadius: 8, flexDirection: "row", gap: 12, justifyContent: "center", alignItems: "center", padding: 8 },
  deleteText: { fontSize: 16, lineHeight: 24, fontWeight: "700", color: theme.color.danger },
});
