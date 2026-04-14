import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { THEME } from '../src/constants/theme';
import { useRouter } from 'expo-router';
import { useHealthStore } from '../src/store/useHealthStore';
import { supabase } from '../src/lib/supabase';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useHealthStore((state) => state.setAuth);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: Platform.OS === 'web' ? `${window.location.origin}/` : 'deetwin://login-callback'
            }
        });

        if (error) throw error;
    } catch (err: any) {
        console.error('Login Error:', err.message);
        alert('Lỗi đăng nhập: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🔥 DEETWIN</Text>
            <Text style={styles.tagline}>AI Health Digital Twin</Text>
        </View>

        <View style={styles.card}>
            <Text style={styles.welcome}>Chào mừng bạn!</Text>
            <Text style={styles.instruction}>Đăng nhập để bắt đầu hành trình "Hack sinh học" và đồng bộ hóa 7 chỉ số sinh trắc của bạn.</Text>

            <TouchableOpacity 
                style={styles.googleBtn} 
                onPress={handleGoogleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <>
                        <Text style={styles.googleBtnText}>Tiếp tục với Google Mail</Text>
                    </>
                )}
            </TouchableOpacity>
            
            <Text style={styles.disclaimer}>* DeeTwin cam kết bảo mật mọi dữ liệu y tế của bạn qua hệ thống Supabase mã hóa.</Text>
        </View>

        <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by Gemini 1.5 Flash & ElevenLabs</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoText: { color: THEME.colors.primary, fontSize: 42, fontWeight: '900', letterSpacing: 2 },
  tagline: { color: THEME.colors.textDim, fontSize: 16, marginTop: 5 },
  card: { backgroundColor: THEME.colors.surface, padding: 30, borderRadius: 24, borderWidth: 1, borderColor: THEME.colors.border, shadowColor: THEME.colors.primary, shadowOpacity: 0.1, shadowRadius: 20 },
  welcome: { color: THEME.colors.text, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  instruction: { color: THEME.colors.textDim, fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  googleBtn: { backgroundColor: THEME.colors.primary, paddingVertical: 18, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  googleBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  disclaimer: { color: THEME.colors.textDim, fontSize: 11, textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  footerText: { color: THEME.colors.textDim, fontSize: 12 }
});
