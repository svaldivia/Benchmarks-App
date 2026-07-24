import { ThemedText } from "@/components/ThemedText";
import { Avatar, Button, Card, IconButton } from "@/components/ds";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { auth } from "@/data/firebase/firebaseConfig";
import { useAppColors } from "@/hooks/useAppColors";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import { Alert, ScrollView, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const email = auth.currentUser?.email ?? "";
  const name = email ? email.split("@")[0] : "athlete";
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  const logout = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
      Alert.alert("Error", "Logout failed");
      setIsSigningOut(false);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-5 pb-4 pt-[60px]">
        <IconButton
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          size="sm"
          round
        >
          <IconSymbol
            name="chevron.left"
            size={24}
            color={colors.textPrimary}
          />
        </IconButton>
        <ThemedText type="title">Settings</ThemedText>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="gap-3 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View className="flex-row items-center gap-3">
            <Avatar name={displayName} size="lg" ring />
            <View className="flex-1">
              <ThemedText type="subtitle">{displayName}</ThemedText>
              {email ? (
                <ThemedText className="text-sm text-text-3">{email}</ThemedText>
              ) : null}
            </View>
          </View>
        </Card>

        <Button
          variant="danger"
          size="lg"
          full
          className="mt-2"
          onPress={logout}
          disabled={isSigningOut}
        >
          {isSigningOut ? "Logging out…" : "Log out"}
        </Button>
      </ScrollView>
    </View>
  );
}
