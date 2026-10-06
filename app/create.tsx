import { Image, Pressable, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { art } from "../src/assets";
import {
  Action,
  Art,
  Card,
  Choice,
  Copy,
  Heading,
  Notice,
  Screen,
  ui,
} from "../src/components/ui";
import { useLocal } from "../src/local/store";
import { useDevice } from "../src/preview/context";
import { theme } from "../src/theme";
import MobileCreatePuzzle from "../src/create/MobileCreatePuzzle";

export default function CreatePuzzle() {
  const { draft, setDraft, pictures } = useLocal();
  const { width, tablet } = useDevice();
  const [rows, columns] = theme.puzzle.grids[draft.gridIndex]!;
  const picture = pictures.find((item) => item.id === draft.pictureId);
  const step = (change: number) =>
    setDraft((value) => ({
      ...value,
      gridIndex: Math.max(0, Math.min(7, value.gridIndex + change)),
    }));
  if (!tablet) return <MobileCreatePuzzle />;
  return (
    <Screen title="Create Puzzle" back={() => router.dismissTo("/")}>
      <View
        style={{
          flexDirection: tablet && width >= 900 ? "row" : "column",
          gap: 20,
        }}
      >
        <View style={{ flex: tablet && width >= 900 ? 3 : undefined, gap: 12 }}>
          <Card
            style={{
              alignItems: "center",
              backgroundColor: theme.color.surfaceSoft,
            }}
          >
            {picture ? (
              <>
                <Image
                  accessibilityLabel={picture.title}
                  source={{ uri: picture.data }}
                  style={{ width: "100%", aspectRatio: 1.5, borderRadius: 12 }}
                />
                <Heading>{picture.title}</Heading>
              </>
            ) : (
              <>
                <Art source={art.gallery} size={112} />
                <Heading>Choose your picture</Heading>
                <Copy muted>Use your collection or add a new photo.</Copy>
              </>
            )}
            <Action
              label={picture ? "Change picture" : "Add Image"}
              onPress={() => router.push("/sources?returnTo=create")}
            />
            {pictures.length > 0 && (
              <Action
                label="Choose from My Collection"
                secondary
                onPress={() => router.push("/collection?select=1")}
              />
            )}
          </Card>
        </View>
        <View style={{ flex: tablet && width >= 900 ? 2 : undefined, gap: 16 }}>
          <Card>
            <View style={ui.row}>
              <Art source={art.piece} size={40} />
              <Heading>Puzzle size</Heading>
            </View>
            <View style={ui.row}>
              {(["Rows", "Columns"] as const).map((label, i) => (
                <View key={label} style={{ flex: 1, gap: 8 }}>
                  <Text style={ui.label}>{label}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <PressStep
                      label={"Decrease " + label}
                      text="−"
                      disabled={draft.gridIndex === 0}
                      onPress={() => step(-1)}
                    />
                    <Text
                      accessibilityLabel={label + ": " + (i ? columns : rows)}
                      style={ui.heading}
                    >
                      {i ? columns : rows}
                    </Text>
                    <PressStep
                      label={"Increase " + label}
                      text="+"
                      disabled={draft.gridIndex === 7}
                      onPress={() => step(1)}
                    />
                  </View>
                </View>
              ))}
            </View>
            <Copy muted>
              {rows * columns} pieces · Rows and columns stay in a 3:2 ratio
            </Copy>
            <Text style={ui.label}>Quick Picks</Text>
            <View style={ui.wrap}>
              {theme.puzzle.presets.map((count) => {
                const i = theme.puzzle.grids.findIndex(
                  ([r, c]) => r * c === count,
                );
                return (
                  <Choice
                    key={count}
                    label={count + " pieces"}
                    selected={i === draft.gridIndex}
                    onPress={() =>
                      setDraft((value) => ({ ...value, gridIndex: i }))
                    }
                  />
                );
              })}
            </View>
          </Card>
          <Card>
            <View style={ui.row}>
              <Art source={art.timer} size={40} />
              <Heading>Timer mode</Heading>
            </View>
            <View style={ui.wrap}>
              <Choice
                label="Stopwatch"
                selected={draft.timer === "stopwatch"}
                onPress={() =>
                  setDraft((value) => ({ ...value, timer: "stopwatch" }))
                }
              />
              <Choice
                label="Countdown"
                selected={draft.timer === "countdown"}
                onPress={() =>
                  setDraft((value) => ({ ...value, timer: "countdown" }))
                }
              />
            </View>
            {draft.timer === "countdown" && (
              <Copy muted>
                Time limits for each puzzle size are awaiting approval.
              </Copy>
            )}
          </Card>
          <Card style={ui.row}>
            <View style={{ flex: 1, gap: 4 }}>
              <Heading>Rotate pieces</Heading>
              <Copy muted>Quarter turns for an extra challenge.</Copy>
            </View>
            <Switch
              accessibilityLabel="Rotate pieces"
              value={draft.rotation}
              onValueChange={(rotation) =>
                setDraft((value) => ({ ...value, rotation }))
              }
              trackColor={{ true: theme.color.primary }}
            />
          </Card>
        </View>
      </View>
      <Card style={ui.row}>
        <Art source={art.ready} size={64} />
        <View style={{ flex: 1 }}>
          <Heading>
            {picture ? "Your puzzle setup" : "Ready to create?"}
          </Heading>
          <Copy muted>
            {picture
              ? rows +
                " × " +
                columns +
                " · " +
                rows * columns +
                " pieces · " +
                (draft.timer === "none" ? "Timer off" : draft.timer === "stopwatch" ? "Stopwatch" : "Countdown")
              : "Choose an image, then set your puzzle size and timer mode."}
          </Copy>
        </View>
      </Card>
      <Action label="Create Puzzle" disabled />
      <Notice>
        {picture
          ? "Puzzle setup is ready for review. Play becomes available when the gameplay engine is connected."
          : "Choose a picture first. Gameplay is the next implementation stage."}
      </Notice>
    </Screen>
  );
}
function PressStep({
  label,
  text,
  disabled,
  onPress,
}: {
  label: string;
  text: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.color.surfaceSoft,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Text style={{ fontSize: 26, color: theme.color.primary }}>{text}</Text>
    </Pressable>
  );
}
