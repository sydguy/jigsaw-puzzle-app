import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { art } from "../../src/assets";
import {
  Action,
  Art,
  Card,
  Copy,
  Heading,
  Notice,
  Screen,
  ui,
} from "../../src/components/ui";
import { useLocal } from "../../src/local/store";
import { useDevice } from "../../src/preview/context";
import { theme } from "../../src/theme";
const sections = [
  { key: "account", label: "Account", art: art.account },
  { key: "billing", label: "Billing", art: art.billing },
  { key: "privacy", label: "Privacy & Legal", art: art.privacy },
  { key: "faq", label: "FAQ", art: art.faq },
  { key: "support", label: "Support", art: art.support },
] as const;
type Section = (typeof sections)[number]["key"];
export default function Settings() {
  const local = useLocal(),
    { tablet, width } = useDevice();
  const [section, setSection] = useState<Section | null>(null),
    [error, setError] = useState("");
  const save = async (key: "sound" | "haptics", value: boolean) => {
    setError("");
    try {
      await local.savePreferences({ ...local.preferences, [key]: value });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save preferences.");
    }
  };
  return (
    <Screen
      title={
        section
          ? sections.find((item) => item.key === section)!.label
          : "Settings"
      }
      tab={!tablet && section === "billing" ? undefined : "Settings"}
      back={section ? () => setSection(null) : undefined}
    >
      <Card style={ui.row}>
        <Art source={art.account} />
        <View style={{ flex: 1 }}>
          <Heading>Playing as a guest</Heading>
          <Copy muted>Your collection stays on this device.</Copy>
        </View>
      </Card>
      <View
        style={{
          flexDirection: tablet && width >= 900 ? "row" : "column",
          gap: 20,
        }}
      >
        {(!section || tablet) && (
          <Card style={{ flex: tablet && width >= 900 ? 1 : undefined }}>
            {sections.map((item) => (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: section === item.key }}
                onPress={() => setSection(item.key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  minHeight: 64,
                  padding: 8,
                  gap: 16,
                  borderRadius: 12,
                  backgroundColor:
                    section === item.key ? theme.color.selected : "#fff",
                }}
              >
                <Art source={item.art} size={40} />
                <Text style={[ui.body, { flex: 1, fontWeight: "600" }]}>
                  {item.label}
                </Text>
                <Text style={ui.heading}>›</Text>
              </Pressable>
            ))}
          </Card>
        )}
        <View style={{ flex: tablet && width >= 900 ? 2 : undefined, gap: 16 }}>
          {!section && (
            <Card>
              <Heading>Play preferences</Heading>
              {(["sound", "haptics"] as const).map((key) => (
                <View key={key} style={ui.row}>
                  <View style={{ flex: 1 }}>
                    <Copy>
                      {key === "sound" ? "Sound effects" : "Haptic feedback"}
                    </Copy>
                  </View>
                  <Switch
                    accessibilityLabel={
                      key === "sound" ? "Sound effects" : "Haptic feedback"
                    }
                    value={local.preferences[key]}
                    disabled={local.busy || local.loading || !!local.error}
                    onValueChange={(value) => {
                      void save(key, value);
                    }}
                    trackColor={{ true: theme.color.primary }}
                  />
                </View>
              ))}
              <Copy muted>
                Preferences are saved locally. Gameplay sound and device haptics
                will be connected with play.
              </Copy>
            </Card>
          )}
          {section === "account" && (
            <Card>
              <Heading>Your account</Heading>
              <Copy>
                Sign-in is not connected yet. Your guest pictures remain
                available in My Collection.
              </Copy>
              <Notice>
                Apple, Google and email sign-in will be available after account
                integration.
              </Notice>
            </Card>
          )}
          {section === "billing" && (
            <Card>
              <Heading>Purchases & subscriptions</Heading>
              <Copy>
                No store is connected in this browser build. Prices, purchase
                history and restore will appear after verified billing
                integration.
              </Copy>
              <Notice>
                Ad-free access and premium picture packs are separate purchases.
                No payment can be made here yet.
              </Notice>
            </Card>
          )}
          {section === "privacy" && (
            <Card>
              <Heading>Your pictures stay with you</Heading>
              <Copy>
                Personal pictures are stored only in this browser. Clearing site
                data can remove your collection.
              </Copy>
              <Copy>
                No usage analytics, advertising or cloud photo upload is active
                in this build.
              </Copy>
              <Notice>
                Published privacy, terms and support pages are awaiting release
                review. The old website mock is not an active policy.
              </Notice>
            </Card>
          )}
          {section === "faq" && (
            <Card>
              <Heading>Where are my pictures saved?</Heading>
              <Copy>
                In this browser on this device. They do not sync to another
                phone or tablet.
              </Copy>
              <Heading>Can I reuse a picture?</Heading>
              <Copy>
                Yes. Choose a saved picture in Create Puzzle. Its 3:2 crop stays
                the same.
              </Copy>
              <Heading>Why can’t I start playing yet?</Heading>
              <Copy>
                This build covers navigation, your local collection and puzzle
                setup. Gameplay is the next stage.
              </Copy>
            </Card>
          )}
          {section === "support" && (
            <Card>
              <Heading>Support</Heading>
              <Copy>
                The contact service is not connected yet. For this development
                preview, share feedback with the project owner.
              </Copy>
              <Notice>No support message has been sent.</Notice>
            </Card>
          )}
          {!!(error || local.error) && (
            <Notice error>{error || local.error}</Notice>
          )}
          {!!local.error && (
            <Action
              label="Retry loading"
              secondary
              onPress={() => {
                void local.reload();
              }}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
