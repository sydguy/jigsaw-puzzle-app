import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { theme } from "../src/theme";
import PreviewHost from "../src/preview/PreviewHost";
import { LocalProvider } from "../src/local/store";
import { PuzzleSessionProvider } from "../src/puzzle/session";
import { GameLibraryProvider } from "../src/game/library";

export default function RootLayout() {
  return (
    <GameLibraryProvider><PreviewHost>
      <LocalProvider>
        <PuzzleSessionProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
            contentStyle: { backgroundColor: theme.color.canvas },
          }}
        />
        </PuzzleSessionProvider>
      </LocalProvider>
    </PreviewHost></GameLibraryProvider>
  );
}
