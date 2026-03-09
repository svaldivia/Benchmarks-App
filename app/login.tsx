import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/data/firebase/firebaseConfig';
import { useThemeColor } from '@/hooks/useThemeColor';
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
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  // Placeholder functions - to be implemented later
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
    // Clear form when switching modes
    setEmail('');
    setPassword('');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ThemedView style={styles.formContainer}>
          {/* Title */}
          <ThemedText type="title" style={styles.title}>
            {isSignUpMode ? 'Sign Up' : 'Log In'}
          </ThemedText>

          {/* Email Input */}
          <ThemedView style={styles.inputContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Email
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: iconColor,
                  color: textColor,
                  backgroundColor: backgroundColor,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={iconColor}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>

          {/* Password Input */}
          <ThemedView style={styles.inputContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Password
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: iconColor,
                  color: textColor,
                  backgroundColor: backgroundColor,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={iconColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: tintColor }]}
            onPress={isSignUpMode ? handleSignUp : handleLogin}
            disabled={isLoading}
          >
            <ThemedText
              style={[styles.submitButtonText, { color: '#fff' }]}
              type="defaultSemiBold"
            >
              {isLoading
                ? 'Please wait...'
                : isSignUpMode
                ? 'Sign Up'
                : 'Log In'}
            </ThemedText>
          </TouchableOpacity>

          {/* Toggle Mode Link */}
          <TouchableOpacity onPress={toggleMode} style={styles.toggleContainer}>
            <ThemedText
              type="link"
              style={[styles.toggleText, { color: tintColor }]}
            >
              {isSignUpMode
                ? 'Already have an account? Log in'
                : "Don't have an account? Sign up"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitButtonText: {
    fontSize: 16,
  },
  toggleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
