import { useFonts } from 'expo-font';
import { Redirect, Stack, usePathname, useRouter } from 'expo-router';
import 'react-native-reanimated';

import { auth } from '@/data/firebase/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        return router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const pathname = usePathname();
  const isLoginRoute = pathname === '/login';

  auth.authStateReady().then(() => {
    console.log('authStateReady', auth.currentUser);
    if (!isLoginRoute && !auth.currentUser) {
      console.log('Redirecting to login', auth.currentUser);
      return <Redirect href="/login" />;
    }
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
