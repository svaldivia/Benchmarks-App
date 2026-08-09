import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors, Palette } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

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
