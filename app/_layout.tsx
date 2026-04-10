import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web") {
      // Force dark background on html/body to prevent white flash
      document.documentElement.style.backgroundColor = "#000";
      document.body.style.backgroundColor = "#000";

      // Tell the browser we prefer dark mode
      const meta = document.createElement("meta");
      meta.name = "color-scheme";
      meta.content = "dark";
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000" },
        }}
      />
    </SafeAreaProvider>
  );
}
