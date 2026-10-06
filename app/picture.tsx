import { useEffect, useState } from "react";
import { Image, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useLocal } from "../src/local/store";
import { useCreateReview } from "../src/create/review";
import {
  Action,
  Card,
  Copy,
  Heading,
  Notice,
  Screen,
  ui,
} from "../src/components/ui";
export default function PictureDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const local = useLocal();
  const review = useCreateReview();
  const picture = local.pictures.find((p) => p.id === id);
  const [title, setTitle] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    setTitle(picture?.title ?? "");
  }, [picture?.title]);
  const run = async (action: () => Promise<void>) => {
    setError("");
    setMessage("");
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The change could not be saved.",
      );
    }
  };
  return (
    <Screen
      title="Picture details"
      back={() => router.dismissTo("/collection")}
    >
      {!picture ? (
        <Notice>
          {local.loading
            ? "Loading picture…"
            : "This picture is not available in your local collection."}
        </Notice>
      ) : (
        <>
          <Image
            accessibilityLabel={picture.title}
            source={{ uri: picture.data }}
            style={{ width: "100%", aspectRatio: 1.5, borderRadius: 16 }}
          />
          <Card>
            <Heading>Picture title</Heading>
            <TextInput
              accessibilityLabel="Picture title"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              style={ui.input}
            />
            <Action
              label="Save title"
              disabled={
                local.busy || !title.trim() || title.trim() === picture.title
              }
              onPress={() => {
                void run(async () => {
                  await local.rename(picture, title);
                  setMessage("Title saved.");
                });
              }}
            />
            <Copy muted>
              My Photo · Times Used: 0{"\n"}Date Added:{" "}
              {new Date(picture.addedAt).toLocaleDateString("en-AU")}
              {"\n"}Last Used: Not yet
            </Copy>
          </Card>
          {!!error && <Notice error>{error}</Notice>}
          {!!message && <Notice>{message}</Notice>}
          <Action
            label="Use for a puzzle"
            onPress={() => {
              review?.setSelectedPicture(null);
              local.setDraft((value) => ({ ...value, pictureId: picture.id }));
              router.replace("/create");
            }}
          />
          {confirm ? (
            <Card>
              <Heading>Delete this picture?</Heading>
              <Copy>
                This removes “{picture.title}” from this browser and its 0
                associated puzzles. This cannot be undone.
              </Copy>
              <Action
                label="Cancel deletion"
                secondary
                onPress={() => setConfirm(false)}
              />
              <Action
                label="Delete picture permanently"
                danger
                disabled={local.busy}
                onPress={() => {
                  void run(async () => {
                    await local.remove(picture);
                    router.replace("/collection");
                  });
                }}
              />
            </Card>
          ) : (
            <Action
              label="Delete picture"
              secondary
              onPress={() => setConfirm(true)}
            />
          )}
        </>
      )}
    </Screen>
  );
}
