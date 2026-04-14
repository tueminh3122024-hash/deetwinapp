import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Kiểm tra xem có đang chạy trong môi trường có window (web client) hoặc native không
const isWeb = Platform.OS === 'web';
const canUseStorage = !isWeb || (isWeb && typeof window !== 'undefined');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: canUseStorage ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
