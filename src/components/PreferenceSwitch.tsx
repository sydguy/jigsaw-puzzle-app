import { KeyboardEvent } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { theme } from "../theme";

export default function PreferenceSwitch({ label, value, disabled = false, onChange }: {
  label: string; value: boolean; disabled?: boolean; onChange: (value: boolean) => void;
}) {
  return <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value, disabled }} aria-checked={value}
    disabled={disabled} onPress={() => onChange(!value)}
    {...(Platform.OS === "web" ? { onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === " ") { event.preventDefault(); if (!disabled) onChange(!value); }
    } } : {})}
    style={[s.target, disabled && { opacity: 0.5 }]}>
    <View testID="preference-switch-track" style={[s.track, value && s.on]}>
      <View style={[s.thumb, value && s.thumbOn]} />
    </View>
  </Pressable>;
}
const s = StyleSheet.create({
  target: { width: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  track: { width: 48, height: 28, borderRadius: 999, borderWidth: 2, borderColor: theme.color.controlBorder, backgroundColor: "#B7B2C9" },
  on: { borderColor: theme.color.primary, backgroundColor: theme.color.primary },
  thumb: { position: "absolute", left: 2, top: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: theme.color.surface, boxShadow: "0 1px 3px #17124f30" },
  thumbOn: { left: 22 },
});
