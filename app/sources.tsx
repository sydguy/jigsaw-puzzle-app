import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { art } from "../src/assets";
import { Art, Copy, Empty, Notice, Screen, ui } from "../src/components/ui";
import { StorageStatus } from "../src/components/StorageStatus";
import PhotoImport from "../src/images/PhotoImport";
import { useLocal } from "../src/local/store";
import { theme } from "../src/theme";
import { useDevice } from "../src/preview/context";
import MobileImageSources from "../src/images/MobileImageSources";
export default function Sources() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const local = useLocal();
  const { tablet } = useDevice();
  const [source, setSource] = useState<"curated" | "photo" | "camera">(
    "curated",
  );
  const destination = returnTo === "create" ? "/create" : "/collection";
  if (!tablet) return <MobileImageSources onBack={() => router.dismissTo(destination)} onAdded={id => {
    if (destination === "/create") local.setDraft(value => ({ ...value, pictureId: id }));
    router.dismissTo(destination);
  }} />;
  return (
    <Screen title="Add Picture" back={() => router.dismissTo(destination)}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(
          [
            { id: "curated", title: "Curated", art: art.curated },
            { id: "photo", title: "My Photos", art: art.gallery },
            { id: "camera", title: "Camera", art: art.camera },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            accessibilityState={{ selected: source === item.id }}
            onPress={() => setSource(item.id)}
            style={{
              flex: 1,
              padding: 8,
              gap: 8,
              alignItems: "center",
              borderWidth: 2,
              borderColor:
                source === item.id ? theme.color.primary : theme.color.border,
              backgroundColor:
                source === item.id ? theme.color.selected : "#fff",
              borderRadius: 16,
            }}
          >
            <Art source={item.art} size={56} />
            <Text style={[ui.label, { textAlign: "center" }]}>
              {source === item.id ? "✓ " : ""}
              {item.title}
            </Text>
          </Pressable>
        ))}
      </View>
      <StorageStatus />
      {source === "curated" && (
        <Empty
          title="A collection worth exploring"
          description="The curated catalogue is being prepared. You can add one of your own photos now."
          source={art.curated}
          action={{
            label: "Choose a personal photo",
            onPress: () => setSource("photo"),
          }}
        />
      )}
      {source === "photo" && (
        <PhotoImport
          onAdded={(id) => {
            if (destination === "/create")
              local.setDraft((value) => ({ ...value, pictureId: id }));
            router.dismissTo(destination);
          }}
        />
      )}
      {source === "camera" && (
        <>
          <Empty
            title="Capture a new favourite"
            description="Camera capture is not connected in this browser build yet."
            source={art.camera}
            action={{
              label: "Choose an existing photo",
              onPress: () => setSource("photo"),
            }}
          />
          <Notice>
            Camera permissions will be requested only when capture is
            implemented and you choose to use it.
          </Notice>
        </>
      )}
      <Copy muted>
        One picture at a time. Adding a picture does not upload it or start a
        puzzle.
      </Copy>
    </Screen>
  );
}
