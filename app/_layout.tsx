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
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  type ErrorBoundaryProps,
} from "expo-router";
import { View } from "react-native";
import "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ds";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StatusBar } from "expo-status-bar";
import "../global.css";

/**
 * Expo Router picks up this named export and wraps the root route in it, so it
 * is the last-resort catch for anything thrown while rendering the app —
 * including rejected reads inside a screen's `use()`.
 *
 * It renders in place of the layout, so nothing below can be relied on here:
 * no ThemeProvider, no AuthProvider, no loaded fonts. Keep the UI to
 * components that only need React Native primitives and NativeWind classes.
 *
 * https://docs.expo.dev/router/error-handling/
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-bg px-8">
      <ThemedText type="defaultSemiBold">Something went wrong</ThemedText>
      <ThemedText className="text-center text-sm text-text-2">
        {error.message}
      </ThemedText>
      <Button
        variant="secondary"
        size="sm"
        className="self-center"
        onPress={() => retry()}
      >
        Try again
      </Button>
    </View>
  );
}

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
