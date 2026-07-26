import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from "@expo-google-fonts/hanken-grotesk";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";
import { Saira_700Bold, Saira_800ExtraBold } from "@expo-google-fonts/saira";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "../global.css";

function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Renders its own header row, so suppress the navigator's. */}
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="entry-detail" />
      </Stack.Protected>
      <Stack.Screen
        name="login"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // DS type system: Saira (display), Hanken Grotesk (sans), JetBrains Mono.
  // These ship as static per-weight TTFs, so each weight registers as its own
  // family name (the map key) and is referenced explicitly via the
  // font-display / font-sans-* / font-mono utilities defined in global.css.
  const [loaded] = useFonts({
    Saira_700Bold,
    Saira_800ExtraBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
