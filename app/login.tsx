import { ThemedText } from "@/components/ThemedText";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (error) {
      console.error("Login failed", error);
      Alert.alert("Error", "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setEmail("");
    setPassword("");
  };

  return (
    <View className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        <View className="px-8 py-6">
          <ThemedText type="title" className="mb-8 text-center">
            {isSignUpMode ? "Sign Up" : "Log In"}
          </ThemedText>

          <View className="mb-5">
            <ThemedText type="defaultSemiBold" className="mb-2 text-base">
              Email
            </ThemedText>
            <TextInput
              className="min-h-12 rounded-md border border-border bg-surface px-4 py-3 text-base text-text shadow-xs"
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={colors.tint}
            />
          </View>

          <View className="mb-5">
            <ThemedText type="defaultSemiBold" className="mb-2 text-base">
              Password
            </ThemedText>
            <TextInput
              className="min-h-12 rounded-md border border-border bg-surface px-4 py-3 text-base text-text shadow-xs"
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={colors.tint}
            />
          </View>

          <TouchableOpacity
            className="mb-6 mt-4 min-h-[52px] items-center justify-center rounded-md bg-brand px-6 py-4 shadow-sm"
            onPress={isSignUpMode ? handleSignUp : handleLogin}
            disabled={isLoading}
          >
            <ThemedText type="defaultSemiBold" className="text-base text-on-brand">
              {isLoading ? "Please wait..." : isSignUpMode ? "Sign Up" : "Log In"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} className="items-center py-2">
            <ThemedText className="text-sm text-brand underline">
              {isSignUpMode
                ? "Already have an account? Log in"
                : "Don't have an account? Sign up"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
