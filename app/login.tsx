import { ThemedText } from '@/components/ThemedText';
import { Palette } from '@/constants/Colors';
import { auth } from '@/data/firebase/firebaseConfig';
import { useAppColors } from '@/hooks/useAppColors';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (error) {
      console.error('Login failed', error);
      Alert.alert('Error', 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setEmail('');
    setPassword('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.formContainer}>
          <ThemedText type="title" style={styles.title}>
            {isSignUpMode ? 'Sign Up' : 'Log In'}
          </ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }]}
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

          <View style={styles.inputContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label}>Password</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }]}
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
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={isSignUpMode ? handleSignUp : handleLogin}
            disabled={isLoading}
          >
            <ThemedText style={styles.submitButtonText} type="defaultSemiBold">
              {isLoading ? 'Please wait...' : isSignUpMode ? 'Sign Up' : 'Log In'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} style={styles.toggleContainer}>
            <ThemedText style={[styles.toggleText, { color: colors.tint }]}>
              {isSignUpMode
                ? 'Already have an account? Log in'
                : "Don't have an account? Sign up"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoidingView: { flex: 1, justifyContent: 'center' },
  formContainer: { paddingHorizontal: 32, paddingVertical: 24 },
  title: { textAlign: 'center', marginBottom: 32, fontSize: 28 },
  inputContainer: { marginBottom: 20 },
  label: { marginBottom: 8, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  submitButton: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: { fontSize: 16, color: Palette.white },
  toggleContainer: { alignItems: 'center', paddingVertical: 8 },
  toggleText: { fontSize: 14, textDecorationLine: 'underline' },
});
