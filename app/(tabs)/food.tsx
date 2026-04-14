import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { THEME } from '../../src/constants/theme';
import { useHealthStore } from '../../src/store/useHealthStore';
import { fetchGeminiFoodAdvice, FoodAdviceResponse } from '../../src/services/ai';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function FoodScreen() {
  const { computedState, currentData, language } = useHealthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<FoodAdviceResponse | null>(null);
  const [lastState, setLastState] = useState<boolean | null>(null);

  const isStress = computedState.msi > 1.5;

  const loadAdvice = async (force = false) => {
    // Only load if state changed or forced
    if (!force && lastState === isStress && advice) return;
    
    setLoading(true);
    try {
        const res = await fetchGeminiFoodAdvice(currentData, computedState, language);
        setAdvice(res);
        setLastState(isStress);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvice();
  }, [isStress]);


  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.header}>{t('food_engine')} 🍽️</Text>
        <Text style={styles.status}>
          {t('low_carb_focus')} | {isStress ? t('status_stress') : t('status_stable')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ {t('suggested_meals')}</Text>
        {loading ? (
            <ActivityIndicator color={THEME.colors.primary} />
        ) : (
            advice?.suggestions.map((item, index) => (
                <FoodCard key={index} name={item.name} desc={item.desc} tag={item.tag} color={THEME.colors.stability} />
            ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: THEME.colors.alert }]}>❌ {t('avoid_foods')}</Text>
        {loading ? (
            <ActivityIndicator color={THEME.colors.alert} />
        ) : (
            advice?.avoid.map((item, index) => (
                <FoodCard key={index} name={item.name} desc={item.desc} tag={item.tag} color={THEME.colors.alert} />
            ))
        )}
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={loadAdvice}>
          <Text style={styles.refreshText}>REFRESH AI ENGINE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const FoodCard = ({ name, desc, tag, color }: { name: string, desc: string, tag: string, color: string }) => (
  <View style={[styles.card, { borderColor: color }]}>
    <View style={styles.cardHeader}>
      <Text style={styles.foodName}>{name}</Text>
      <View style={[styles.tag, { backgroundColor: color }]}><Text style={styles.tagText}>{tag}</Text></View>
    </View>
    <Text style={styles.foodDesc}>{desc}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  headerBox: { padding: 25, backgroundColor: THEME.colors.surface, marginBottom: 20 },
  header: { color: THEME.colors.primary, fontSize: 28, fontWeight: 'bold' },
  status: { color: THEME.colors.textDim, marginTop: 5, fontSize: 13 },
  section: { paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: { color: THEME.colors.stability, fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  foodName: { color: THEME.colors.text, fontSize: 18, fontWeight: 'bold' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  foodDesc: { color: THEME.colors.textDim, fontSize: 14, lineHeight: 20 },
  refreshBtn: { margin: 20, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: THEME.colors.textDim, alignItems: 'center' },
  refreshText: { color: THEME.colors.textDim, fontWeight: '900', fontSize: 11, letterSpacing: 1 }
});

