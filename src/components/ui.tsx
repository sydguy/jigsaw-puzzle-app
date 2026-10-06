import { PropsWithChildren, useCallback, useContext, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { art } from "../assets";
import { TabVisibility } from "../navigation/visibility";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";
import { useDevice } from "../preview/context";
import AppScrollView from "./AppScrollView";

export function Copy({
  children,
  muted = false,
}: PropsWithChildren<{ muted?: boolean }>) {
  return <Text style={[ui.body, muted && ui.muted]}>{children}</Text>;
}
export function Heading({ children }: PropsWithChildren) {
  return (
    <Text accessibilityRole="header" style={ui.heading}>
      {children}
    </Text>
  );
}
export function Art({
  source,
  size = 64,
}: {
  source: ImageSourcePropType;
  size?: number;
}) {
  return (
    <Image
      accessible={false}
      source={source}
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}
export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[ui.card, style]}>{children}</View>;
}
export function Notice({
  children,
  error = false,
}: PropsWithChildren<{ error?: boolean }>) {
  return (
    <View
      accessibilityRole={error ? "alert" : undefined}
      style={[ui.notice, error && { backgroundColor: theme.color.dangerSoft }]}
    >
      <Text
        style={[
          ui.body,
          { color: error ? theme.color.danger : theme.color.textSecondary },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}
export function Action({
  label,
  onPress,
  secondary = false,
  disabled = false,
  danger = false,
}: {
  label: string;
  onPress?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({
        pressed,
        focused,
      }: {
        pressed: boolean;
        focused?: boolean;
      }) => [
        ui.button,
        secondary && ui.secondary,
        danger && { backgroundColor: theme.color.danger },
        !secondary &&
          !disabled &&
          Platform.OS === "web" &&
          ({
            backgroundImage: `linear-gradient(110deg, ${danger ? theme.color.danger : theme.color.gradientStart}, ${danger ? theme.color.danger : theme.color.gradientEnd})`,
          } as ViewStyle),
        disabled && ui.disabled,
        pressed && { opacity: 0.8 },
        focused && ui.focus,
      ]}
    >
      <Text
        style={[
          ui.buttonText,
          secondary && { color: theme.color.primary },
          disabled && { color: theme.color.disabledText },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        ui.choice,
        selected && {
          backgroundColor: theme.color.selected,
          borderColor: theme.color.primary,
        },
      ]}
    >
      <Text
        style={[
          ui.label,
          { color: selected ? theme.color.primary : theme.color.textSecondary },
        ]}
      >
        {selected ? "✓ " : ""}
        {label}
      </Text>
    </Pressable>
  );
}
export function Empty({
  title,
  description,
  source,
  action,
}: {
  title: string;
  description: string;
  source: ImageSourcePropType;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <Card style={ui.empty}>
      <Art source={source} size={96} />
      <Heading>{title}</Heading>
      <Text style={[ui.body, ui.muted, { textAlign: "center", maxWidth: 380 }]}>
        {description}
      </Text>
      {action && <Action {...action} />}
    </Card>
  );
}
export function Screen({
  title,
  children,
  tab,
  back,
  right,
  contentStyle,
  fixedContent,
  floatingTabs = false,
  showScrollbar = true,
}: PropsWithChildren<{
  title?: string;
  tab?: "Home" | "My Collection" | "Settings";
  back?: () => void;
  right?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  fixedContent?: React.ReactNode;
  floatingTabs?: boolean;
  showScrollbar?: boolean;
}>) {
  const { tablet } = useDevice();
  const [navHeight, setNavHeight] = useState(70);
  const floatNav = floatingTabs && !!tab && Platform.OS === "web";
  const setTabHidden = useContext(TabVisibility);
  useFocusEffect(useCallback(() => {
    setTabHidden(!tab);
  }, [tab, setTabHidden]));
  return (
    <SafeAreaView style={ui.screen} edges={Platform.OS !== "web" && tab ? ["top", "left", "right"] : undefined}>
      {title && (
        <View style={ui.header}>
          {back && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={back}
              style={ui.back}
            >
              <Text style={{ fontSize: 28, color: theme.color.primary }}>
                ‹
              </Text>
            </Pressable>
          )}
          <Text accessibilityRole="header" style={[ui.title, { flex: 1 }]}>
            {title}
          </Text>
          {right}
        </View>
      )}
      {fixedContent && <View style={{ flexShrink: 0, zIndex: 2 }}>{fixedContent}</View>}
      <AppScrollView
        showScrollbar={showScrollbar}
        style={{ flex: 1 }}
        scrollbarTopInset={fixedContent ? 0 : 16}
        scrollbarBottomInset={floatNav ? navHeight + 20 : 8}
        contentContainerStyle={[{
          padding: tablet ? 24 : 16,
          gap: 20,
          paddingBottom: 28,
        }, contentStyle, floatNav && { paddingBottom: (StyleSheet.flatten(contentStyle)?.paddingBottom as number ?? 28) + navHeight + 12 }]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </AppScrollView>
      {tab && Platform.OS === "web" && (
        <View testID="bottom-tab-bar" onLayout={event => setNavHeight(event.nativeEvent.layout.height)}
          style={[ui.nav, { marginHorizontal: tablet ? 24 : 16 }, floatNav && {
            position: "absolute", left: tablet ? 24 : 16, right: tablet ? 24 : 16, bottom: 12,
            margin: 0, marginHorizontal: 0, zIndex: 3, boxShadow: "0 5px 20px #17124f2e",
          }]}>
          {(
            [
              { label: "Home", path: "/", icon: art.navHome },
              { label: "My Collection", path: "/collection", icon: art.navCollection },
              { label: "Settings", path: "/settings", icon: art.navSettings },
            ] as const
          ).map((item) => (
            <Pressable
              key={item.label}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: tab === item.label }}
              onPress={() => router.replace(item.path)}
              style={[
                ui.navItem,
                tablet && { flexDirection: "row", gap: 8, minHeight: 48, borderRadius: 8, paddingVertical: 2 },
                tab === item.label && { backgroundColor: theme.color.selected },
              ]}
            >
              <Image
                accessible={false}
                source={item.icon}
                resizeMode="contain"
                style={{
                  width: tablet ? 40 : 32,
                  height: tablet ? 40 : 32,
                  tintColor:
                    tab === item.label
                      ? theme.color.primary
                      : theme.color.textSecondary,
                }}
              />
              <Text
                style={[
                  ui.label,
                  {
                    color:
                      tab === item.label
                        ? theme.color.primary
                        : theme.color.textSecondary,
                    textAlign: "center",
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.canvas },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    gap: 12,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    color: theme.color.text,
  },
  heading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: theme.color.text,
  },
  body: { fontSize: 16, lineHeight: 24, color: theme.color.text },
  muted: { color: theme.color.textSecondary },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: theme.color.text,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.color.primary,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  secondary: {
    backgroundColor: "#FFFFFF",
    borderColor: theme.color.controlBorder,
    borderWidth: 1,
  },
  disabled: { backgroundColor: theme.color.disabledSurface },
  focus: { borderWidth: 3, borderColor: theme.color.focus },
  choice: {
    minHeight: 48,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.color.controlBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  notice: {
    padding: 16,
    backgroundColor: theme.color.surfaceSoft,
    borderRadius: 12,
  },
  empty: { alignItems: "center", paddingVertical: 28, gap: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  back: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: theme.color.selected,
    alignItems: "center",
    justifyContent: "center",
  },
  nav: {
    flexDirection: "row",
    margin: 12,
    marginTop: 0,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: "#FFFFFF",
    gap: 4,
  },
  navItem: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 4,
    gap: 0,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.color.controlBorder,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: theme.color.text,
    backgroundColor: "#FFFFFF",
  },
});
