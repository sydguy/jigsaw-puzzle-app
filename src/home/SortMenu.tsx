import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { theme } from "../theme";
import { HomeSort, sortOptions } from "./review";
import { ui } from "../components/ui";

export default function SortMenu({ value, onChange, compact = false }: { value: HomeSort; onChange: (value: HomeSort) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={"Sort puzzles: " + value} accessibilityState={{ expanded: open }}
      onPress={() => setOpen(true)} style={[ui.choice, { minWidth: compact ? 100 : 164, flexDirection: "row", gap: compact ? 8 : 12, backgroundColor: theme.color.surface }]}>
      <Text style={[ui.label, compact && { fontSize: 10 }]}>{value}</Text><Text style={ui.label}>⌄</Text>
    </Pressable>
    <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
      <Pressable accessibilityLabel="Close sorting" onPress={() => setOpen(false)} style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#17124f40" }}>
        <View accessibilityViewIsModal style={[ui.card, { width: "100%", maxWidth: 480, alignSelf: "center" }]}>
          {sortOptions.map(option => <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: option === value }}
            onPress={() => { onChange(option); setOpen(false); }} style={[ui.choice, { flexDirection: "row", justifyContent: "space-between", backgroundColor: option === value ? theme.color.selected : theme.color.surface }]}>
            <Text style={ui.label}>{option}</Text><Text style={ui.label}>{option === value ? "✓" : ""}</Text>
          </Pressable>)}
        </View>
      </Pressable>
    </Modal>
  </>;
}
