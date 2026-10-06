import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "../theme";
export default function CollectionMenu({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return <View style={{ flex: 1, zIndex: open ? 5 : 1 }}><Text style={{ color: theme.color.textSecondary }}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} onPress={() => setOpen(!open)} style={{ minHeight: 48, padding: 12, borderRadius: 8, backgroundColor: theme.color.surface }}><Text>{value} ⌄</Text></Pressable>
    {open && <View style={{ position: "absolute", top: 68, left: 0, right: 0, backgroundColor: theme.color.surface }}>{options.map(option => <Pressable key={option} accessibilityRole="button" onPress={() => { onChange(option); setOpen(false); }} style={{ minHeight: 48, padding: 12 }}><Text>{option}</Text></Pressable>)}</View>}
  </View>;
}
