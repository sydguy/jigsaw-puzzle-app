import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { art } from "../../src/assets";
import {
  Art,
  Card,
  Copy,
  Empty,
  Heading,
  Screen,
  ui,
} from "../../src/components/ui";
import { StorageStatus } from "../../src/components/StorageStatus";
import { theme } from "../../src/theme";

export default function Home() {
  return (
    <Screen tab="Home">
      <Card style={ui.row}>
        <Art source={art.crown} size={48} />
        <View style={{ flex: 1, gap: 4 }}>
          <Heading>Theme Collection</Heading>
          <Copy muted>Guest collection · No purchased packs</Copy>
        </View>
      </Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add Puzzle"
        onPress={() => router.push("/create")}
        style={({ pressed }) => ({
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: 16,
          backgroundColor: theme.color.surfaceSoft,
          padding: 24,
          alignItems: "center",
          gap: 8,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.color.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 40, lineHeight: 48 }}>+</Text>
        </View>
        <Text style={[ui.title, { color: theme.color.primary }]}>
          Add Puzzle
        </Text>
        <Text
          style={[ui.body, { color: theme.color.primary, textAlign: "center" }]}
        >
          Choose a picture and make it a puzzle
        </Text>
      </Pressable>
      <View style={[ui.row, { justifyContent: "space-between" }]}>
        <Heading>My Puzzles (0)</Heading>
        <Text style={[ui.label, ui.muted]}>Latest played</Text>
      </View>
      <StorageStatus />
      <Empty
        title="Your first puzzle awaits"
        description="Start with a picture you love. Your puzzles and progress will appear here."
        source={art.ready}
      />
    </Screen>
  );
}
