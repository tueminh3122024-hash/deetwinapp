import { Tabs } from 'expo-router';
import React from 'react';
import { THEME } from '../../src/constants/theme';
import { Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
        height: 60,
        paddingBottom: 8,
        display: isWebWide ? 'none' : 'flex',
      },
      headerShown: !isWebWide,
      headerStyle: {
        backgroundColor: THEME.colors.background,
      },
      headerTintColor: THEME.colors.primary,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarLabel: 'Stat',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'DeeTwin',
          tabBarLabel: 'Coach',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Nutrition',
          tabBarLabel: 'Food',
          tabBarIcon: ({ color, size }) => <Ionicons name="fast-food-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ Sơ',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}


