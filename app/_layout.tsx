import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { View, useWindowDimensions, Platform } from 'react-native';

import { useHealthStore } from '../src/store/useHealthStore';
import { WebSidebar } from '../src/components/WebSidebar';
import { THEME } from '../src/constants/theme';
import { supabase } from '../src/lib/supabase';

export default function RootLayout() {
  const user = useHealthStore((state) => state.user);
  const setAuth = useHealthStore((state) => state.setAuth);
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { width } = useWindowDimensions();

  const isWebWide = Platform.OS === 'web' && width > 768;

  // Real Auth Listener
  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            setAuth({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata.full_name || 'Health Warrior',
                avatar: session.user.user_metadata.avatar_url || ''
            });
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            setAuth({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata.full_name || 'Health Warrior',
                avatar: session.user.user_metadata.avatar_url || ''
            });
        } else {
            setAuth(null);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!navigationState?.key) return;
    const inAuthGroup = segments[0] === '(tabs)';
    const isRoot = segments.length === 0 || (segments.length === 1 && segments[0] === '');
    
    const timer = setTimeout(() => {
      if (!user && (inAuthGroup || isRoot)) {
        router.replace('/login');
      } else if (user && segments[0] === 'login') {
        router.replace('/(tabs)');
      }
    }, 1);

    return () => clearTimeout(timer);
  }, [user, segments, navigationState?.key]);

  return (
    <ThemeProvider value={DarkTheme}>
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, flexDirection: isWebWide ? 'row' : 'column' }}>
        {isWebWide && <WebSidebar />}
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Settings' }} />
          </Stack>
        </View>
      </View>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
