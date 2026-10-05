import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { theme } from "../src/theme";
import PreviewHost from "../src/preview/PreviewHost";
import { LocalProvider } from "../src/local/store";

export default function RootLayout() {
  return (
    <PreviewHost>
      <LocalProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
            contentStyle: { backgroundColor: theme.color.canvas },
          }}
        />
      </LocalProvider>
    </PreviewHost>
  );
}
