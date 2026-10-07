import { Image, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { art } from "../assets";
import { theme } from "../theme";

const gradient = Platform.OS === "web" ? {
  backgroundImage: `linear-gradient(110deg, ${theme.color.gradientStart}, ${theme.color.gradientEnd})`,
} as ViewStyle : {};

export default function HomePuzzleActions({ changed, canContinue, onCreate, onPlay }: {
  changed: boolean; canContinue: boolean; onCreate: () => void;
  onPlay: (action: "Play Again" | "Continue Playing") => void;
}) {
  const labels = changed ? ["Create Puzzle"] as const
    : canContinue ? ["Play Again", "Continue Playing"] as const : ["Play Again"] as const;
  return <View style={s.row} testID="home-puzzle-actions">
    {labels.map(label => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label}
      onPress={() => label === "Create Puzzle" ? onCreate() : onPlay(label)}
      style={({ pressed }) => [s.button, gradient, pressed && { opacity: 0.85 }]}>
      {label === "Create Puzzle" ? <Image accessible={false} source={art.piece} resizeMode="contain" style={s.piece} />
        : <Text accessible={false} style={s.icon}>{label === "Play Again" ? "↻" : "▶"}</Text>}
      <Text style={[s.label, labels.length === 2 && s.halfLabel]}>{label}</Text>
    </Pressable>)}
  </View>;
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  button: { flex: 1, minHeight: 48, paddingHorizontal: 8, paddingVertical: 10, borderRadius: 12,
    backgroundColor: theme.color.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  piece: { width: 24, height: 24, tintColor: theme.color.surface },
  icon: { fontSize: 22, lineHeight: 26, color: theme.color.surface },
  label: { fontSize: 18, lineHeight: 24, fontWeight: "700", color: theme.color.surface, flexShrink: 1, textAlign: "center" },
  halfLabel: { fontSize: 14, lineHeight: 20 },
});
