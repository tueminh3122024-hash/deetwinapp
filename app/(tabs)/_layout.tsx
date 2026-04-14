import { Tabs } from 'expo-router';
import React from 'react';
import { THEME } from '../../src/constants/theme';
import { Platform, useWindowDimensions } from 'react-native';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isWebWide = Platform.OS === 'web' && width > 768;

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: THEME.colors.primary,
      tabBarInactiveTintColor: THEME.colors.textDim,
      tabBarStyle: {
        backgroundColor: THEME.colors.surface,
        borderTopColor: THEME.colors.border,
        elevation: 0,
        display: isWebWide ? 'none' : 'flex',
      },
      headerShown: !isWebWide, // Hide header on web-wide as we use sidebar logo
      headerStyle: {
        backgroundColor: THEME.colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: THEME.colors.primary,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Phân tích',
          tabBarLabel: 'Stat',
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'AI Coach',
          tabBarLabel: 'Coach',
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Điểm Tâm',
          tabBarLabel: 'Food',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ Sơ',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}

