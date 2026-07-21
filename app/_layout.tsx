import { useFonts } from "expo-font";
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
import { Redirect, Stack, usePathname, useRouter } from "expo-router";
import "react-native-reanimated";

import { auth } from "@/data/firebase/firebaseConfig";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../global.css";

export default function RootLayout() {
  const router = useRouter();
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        return router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const pathname = usePathname();
  const isLoginRoute = pathname === "/login";

  auth.authStateReady().then(() => {
    console.log("authStateReady", auth.currentUser);
    if (!isLoginRoute && !auth.currentUser) {
      console.log("Redirecting to login", auth.currentUser);
      return <Redirect href="/login" />;
    }
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Auth gate: no header/back button and no swipe-back — navigating away
            from login while signed out breaks the app. */}
        <Stack.Screen
          name="login"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        {/* Renders its own header row, so suppress the navigator's. */}
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
