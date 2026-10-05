import { useState } from "react";
import {
  DimensionValue,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { art } from "../../src/assets";
import { Action, Choice, Copy, Empty, Screen, ui } from "../../src/components/ui";
import { StorageStatus } from "../../src/components/StorageStatus";
import { useLocal } from "../../src/local/store";
import { useDevice } from "../../src/preview/context";
import { theme } from "../../src/theme";
export default function Collection() {
  const { select } = useLocalSearchParams<{ select?: string }>();
  const local = useLocal();
  const { tablet } = useDevice();
  const [detailed, setDetailed] = useState(false);
  const [query, setQuery] = useState("");
  const [oldest, setOldest] = useState(false);
  const pictures = local.pictures
    .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (oldest ? a.addedAt - b.addedAt : b.addedAt - a.addedAt));
  const columns = tablet ? 6 : 3;
  return (
    <Screen
      title={select ? "Choose a picture" : "My Collection"}
      tab={select ? undefined : "My Collection"}
      back={select ? () => router.replace("/create") : undefined}
    >
      <Action
        label="Add Picture"
        onPress={() =>
          router.push({
            pathname: "/sources",
            params: { returnTo: select ? "create" : "collection" },
          })
        }
      />
      <View style={ui.wrap}>
        <Choice
          label="Grid"
          selected={!detailed}
          onPress={() => setDetailed(false)}
        />
        <Choice
          label="Details"
          selected={detailed}
          onPress={() => setDetailed(true)}
        />
        <Choice
          label={oldest ? "Oldest first" : "Newest first"}
          selected={oldest}
          onPress={() => setOldest((value) => !value)}
        />
      </View>
      <TextInput
        accessibilityLabel="Search collection"
        placeholder="Search your pictures"
        value={query}
        onChangeText={setQuery}
        style={ui.input}
      />
      <Text style={ui.label}>
        Theme: My Photo · {pictures.length}{" "}
        {pictures.length === 1 ? "picture" : "pictures"}
      </Text>
      <StorageStatus />
      {!local.loading && !local.error && !pictures.length && (
        <Empty
          source={art.gallery}
          title={query ? "No matching pictures" : "Make it your collection"}
          description={
            query
              ? "Try a different title or clear your search."
              : "Add a picture once and use it for as many puzzles as you like."
          }
          action={
            query
              ? { label: "Clear search", onPress: () => setQuery("") }
              : undefined
          }
        />
      )}
      <View
        testID="collection-grid"
        style={{
          flexDirection: detailed ? "column" : "row",
          flexWrap: detailed ? "nowrap" : "wrap",
          marginHorizontal: -4,
          gap: detailed ? 8 : 0,
        }}
      >
        {pictures.map((picture) => (
          <View
            key={picture.id}
            style={{
              width: detailed
                ? "100%"
                : ((100 / columns + "%") as DimensionValue),
              padding: 4,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                (select ? "Select " : "Open ") + picture.title
              }
              onPress={() => {
                if (select) {
                  local.setDraft((value) => ({
                    ...value,
                    pictureId: picture.id,
                  }));
                  router.replace("/create");
                } else
                  router.push({
                    pathname: "/picture",
                    params: { id: picture.id },
                  });
              }}
              style={({ pressed }) => ({
                padding: 8,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: 12,
                gap: 8,
                flexDirection: detailed ? "row" : "column",
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Image
                source={{ uri: picture.data }}
                accessibilityLabel={picture.title}
                style={{
                  width: detailed ? 96 : "100%",
                  aspectRatio: 1.5,
                  borderRadius: 8,
                }}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Text numberOfLines={2} style={ui.label}>
                  {picture.title}
                </Text>
                <Text
                  style={{ fontSize: 12, color: theme.color.textSecondary }}
                >
                  My Photo
                </Text>
                {detailed && (
                  <Copy muted>
                    Times Used: 0{"\n"}Date Added:{" "}
                    {new Date(picture.addedAt).toLocaleDateString("en-AU")}
                    {"\n"}Last Used: Not yet
                  </Copy>
                )}
              </View>
            </Pressable>
          </View>
        ))}
      </View>
      <Copy muted>
        Pictures stay in this browser on this device. Clearing site data removes
        them.
      </Copy>
    </Screen>
  );
}
