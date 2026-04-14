import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthStore } from '../../src/store/useHealthStore';
import { THEME } from '../../src/constants/theme';
import { fetchGeminiOSAP, fetchElevenLabsVoice, OSAPResponse } from '../../src/services/ai';
import { Audio } from 'expo-av';

export default function CoachScreen() {
  const { currentData, computedState, history } = useHealthStore();
  const [advice, setAdvice] = useState<OSAPResponse | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const getAdvice = async () => {
    setAdvice(null);
    setLoading(true);
    try {
      const result = await fetchGeminiOSAP(currentData, computedState, history);
      setAdvice(result);
    } catch (error) {
      setAdvice("Lỗi kết nối bộ não AI, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const playVoice = async () => {
    if (!advice) return;
    setAudioLoading(true);
    try {
        const fullText = typeof advice === 'string' 
            ? advice 
            : `${advice.currentState}. Dự đoán tiếp theo là: ${advice.prediction}`;
            
        const url = await fetchElevenLabsVoice(fullText);
        if (url) {
            const { sound } = await Audio.Sound.createAsync({ uri: url });
            await sound.playAsync();
        }
    } catch (err) {
        console.error("Voice playback error", err);
    } finally {
        setAudioLoading(false);
    }
  };

  const renderAdviceCards = () => {
    if (!advice) return null;

    if (typeof advice === 'string') {
        return (
            <View style={styles.adviceCard}>
                <Text style={styles.adviceText}>{advice}</Text>
            </View>
        );
    }

    // Ẩn nhãn kỹ thuật (currentState/prediction), dùng nhãn Tiếng Việt thân thiện
    const items = [
        { title: '📊 Hiện trạng cơ thể', content: advice.currentState },
        { title: '🔮 Dự báo xu hướng', content: advice.prediction },
    ];

    return items.map((item, index) => (
        <View key={index} style={styles.adviceCard}>
            <Text style={styles.adviceTitle}>{item.title}</Text>
            <Text style={styles.adviceText}>{item.content}</Text>
        </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>AI Coach 🧠</Text>
        <Text style={styles.subHeader}>Deep Insights Engine</Text>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={getAdvice}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.actionBtnText}>Analyze My State ✨</Text>
          )}
        </TouchableOpacity>

        {advice ? (
          <View>
            <View style={styles.contentContainer}>
                {renderAdviceCards()}
            </View>
            
            <TouchableOpacity 
                style={styles.voiceBtn} 
                onPress={playVoice} 
                disabled={audioLoading}
            >
              {audioLoading ? (
                  <ActivityIndicator color={THEME.colors.primary} />
              ) : (
                  <Text style={styles.voiceBtnText}>🔊 Nghe phân tích (Voice)</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nhấn nút trên để nhận Hiện trạng & Dự báo từ DeeTwin.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  scroll: { padding: 20, paddingBottom: 100 },
  header: { color: THEME.colors.primary, fontSize: 28, fontWeight: 'bold' },
  subHeader: { color: THEME.colors.textDim, fontSize: 14, marginBottom: 20 },
  actionBtn: { backgroundColor: THEME.colors.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 25 },
  actionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  contentContainer: { gap: 15 },
  adviceCard: { 
    backgroundColor: THEME.colors.surface, 
    padding: 22, 
    borderRadius: 16, 
    borderLeftWidth: 6, 
    borderLeftColor: THEME.colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.1)'
  },
  adviceTitle: { color: THEME.colors.primary, fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  adviceText: { color: THEME.colors.text, fontSize: 17, lineHeight: 26 },
  voiceBtn: { marginTop: 30, backgroundColor: 'rgba(0, 240, 255, 0.2)', padding: 18, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: THEME.colors.primary },
  voiceBtnText: { color: THEME.colors.primary, fontWeight: 'bold', fontSize: 16 },
  emptyCard: { backgroundColor: THEME.colors.surface, padding: 40, borderRadius: 16, alignItems: 'center', opacity: 0.6 },
  emptyText: { color: THEME.colors.textDim, textAlign: 'center' }
});
