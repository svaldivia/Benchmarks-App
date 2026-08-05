import { Tabs, type ErrorBoundaryProps } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ds";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors, Palette } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

/**
 * Expo Router picks up this named export and wraps the tab group in it, so it
 * catches anything thrown while rendering a tab screen — including a rejected
 * read inside a screen's `use()` — without taking down the rest of the app.
 *
 * It renders in place of the navigator, so the tab bar is gone while it shows
 * and the screens below it are unmounted. It also sits under the root layout,
 * so theme/auth context and loaded fonts are still available here.
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

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelStyle: {
          fontFamily: "HankenGrotesk_600SemiBold",
          fontSize: 11,
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        // The default ~49px bar is too short for the 28px icons + labels, so
        // labels get clipped at the bottom (worse on devices with a home
        // indicator). Give it explicit height plus safe-area bottom padding.
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            height: 60 + insets.bottom,
            paddingTop: 8,
          },
          default: {
            backgroundColor: colors.backgroundSecondary,
            borderTopColor: colors.border,
            height: 64 + insets.bottom,
            paddingTop: 8,
            paddingBottom: insets.bottom,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-entry"
        options={{
          title: "",
          tabBarIcon: () => (
            <View className="mb-5 size-14 items-center justify-center rounded-full bg-brand shadow-md">
              <IconSymbol size={28} name="plus" color={Palette.white} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="entries"
        options={{
          title: "Entries",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list.clipboard" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercises",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="dumbbell.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
