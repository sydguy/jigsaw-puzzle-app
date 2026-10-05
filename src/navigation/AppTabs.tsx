import { useState } from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { art } from "../assets";
import { theme } from "../theme";
import { TabVisibility } from "./visibility";

export default function AppTabs() {
  const [hidden, setHidden] = useState(false);
  return (
    <TabVisibility.Provider value={setHidden}>
      <NativeTabs
        hidden={hidden}
        backgroundColor={theme.color.surface}
        tintColor={theme.color.primary}
        iconColor={{ default: theme.color.textSecondary, selected: theme.color.primary }}
        labelStyle={{ default: { color: theme.color.textSecondary }, selected: { color: theme.color.primary } }}
        indicatorColor={theme.color.selected}
        disableTransparentOnScrollEdge
        minimizeBehavior="never"
        sidebarAdaptable={false}
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon src={art.navHome} renderingMode="template" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="collection" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon src={art.navCollection} renderingMode="template" />
          <NativeTabs.Trigger.Label>My Collection</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon src={art.navSettings} renderingMode="template" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </TabVisibility.Provider>
  );
}
