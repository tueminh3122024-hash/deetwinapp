import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../hooks/useTranslation';
import { useHealthStore } from '../store/useHealthStore';
import { supabase } from '../lib/supabase';



export const WebSidebar = () => {
  const router = useRouter();
  const segments = useSegments();
  const { t, language } = useTranslation();
  const toggleLanguage = useHealthStore((state) => state.toggleLanguage);
  const setAuth = useHealthStore((state) => state.setAuth);
  
  const activeTab = segments[1] || 'index';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuth(null);
    router.replace('/login');
  };

  const NavItem = ({ name, icon, label, target }: any) => {

    const isActive = activeTab === name;
    return (
      <TouchableOpacity 
        style={[styles.navItem, isActive && styles.activeNavItem]} 
        onPress={() => router.push(target)}
      >
        <Ionicons 
            name={icon} 
            size={20} 
            color={isActive ? THEME.colors.primary : THEME.colors.textDim} 
        />
        <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>DEETWIN</Text>
      </View>
      
      <ScrollView style={styles.navScroll}>
        <NavItem name="index" icon="grid-outline" label={t('dashboard')} target="/(tabs)" />
        <NavItem name="coach" icon="sparkles-outline" label={t('coach')} target="/(tabs)/coach" />
        <NavItem name="food" icon="fast-food-outline" label={t('food')} target="/(tabs)/food" />
        <NavItem name="profile" icon="person-outline" label={t('profile')} target="/(tabs)/profile" />
      </ScrollView>


      <View style={styles.footer}>
        <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
          <Ionicons name="language-outline" size={20} color={THEME.colors.primary} />
          <Text style={styles.langText}>{language === 'vn' ? 'Tiếng Việt' : 'English'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={THEME.colors.alert} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: THEME.colors.surface,
    borderRightWidth: 1,
    borderRightColor: THEME.colors.border,
    height: '100%',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  logo: {
    color: THEME.colors.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  navScroll: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 5,
  },
  activeNavItem: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  navLabel: {
    color: THEME.colors.textDim,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 15,
  },
  activeNavLabel: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  logoutText: {
    color: THEME.colors.alert,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 15,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    marginBottom: 10,
  },
  langText: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 15,
  }
});

