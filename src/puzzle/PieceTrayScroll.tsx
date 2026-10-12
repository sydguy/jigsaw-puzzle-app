import { PropsWithChildren } from "react";
import { ScrollView } from "react-native";

export default function PieceTrayScroll({ children }: PropsWithChildren) {
  return <ScrollView horizontal accessibilityLabel="Puzzle piece tray" showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ gap: 10, paddingHorizontal: 8, alignItems: "center" }}>
    {children}
  </ScrollView>;
}
