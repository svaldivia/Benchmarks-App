import { ThemedText } from "@/components/ThemedText";
// SegmentedControl unused while sign up is disabled.
import { Button, Input, LogoLockup } from "@/components/ds";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { auth } from "@/data/firebase/firebaseConfig";
import { useAppColors } from "@/hooks/useAppColors";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useAppColors();
  // Restore the setter alongside setMode when sign up is re-enabled.
  const [isSignUpMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      if (isSignUpMode) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace("/");
    } catch (error) {
      console.error(isSignUpMode ? "Sign up failed" : "Login failed", error);
      Alert.alert("Error", isSignUpMode ? "Sign up failed" : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // const setMode = (mode: string) => {
  //   setIsSignUpMode(mode === "signup");
  //   setEmail("");
  //   setPassword("");
  // };

  return (
    <View className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-7 py-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-10 items-center">
            <LogoLockup size={72} />
            <ThemedText className="mt-3 text-center text-body-lg text-text-2">
              Track your training. Beat your benchmarks.
            </ThemedText>
          </View>

          {/* Sign up temporarily disabled — login only.
          <SegmentedControl
            full
            value={isSignUpMode ? "signup" : "login"}
            onChange={setMode}
            options={[
              { value: "login", label: "Log in" },
              { value: "signup", label: "Sign up" },
            ]}
            className="mb-7"
          />
          */}

          <View className="gap-5">
            <Input
              label="Email"
              placeholder="you@example.com"
              icon={
                <IconSymbol
                  name="envelope.fill"
                  size={20}
                  color={colors.textMuted}
                />
              }
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              icon={
                <IconSymbol
                  name="lock.fill"
                  size={20}
                  color={colors.textMuted}
                />
              }
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Button
            variant="primary"
            size="lg"
            full
            onPress={submit}
            disabled={isLoading}
            className="mt-8"
          >
            {isLoading ? "Please wait…" : isSignUpMode ? "Create account" : "Log in"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
