import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useHealthStore } from '../../src/store/useHealthStore';
import { THEME } from '../../src/constants/theme';
import { MetricCircle } from '../../src/components/MetricCircle';
import { LivePulseChart } from '../../src/components/LivePulseChart';
import { LiveActivityFeed } from '../../src/components/LiveActivityFeed';
import { InputHub } from '../../src/components/InputHub';
import { fetchGeminiOSAP, fetchElevenLabsVoice } from '../../src/services/ai';
import { Audio } from 'expo-av';


import { LiveStatusHeader } from '../../src/components/LiveStatusHeader';
import { useTranslation } from '../../src/hooks/useTranslation';
import { InfoModal } from '../../src/components/InfoModal';
import { TextInput } from 'react-native';




export default function DashboardScreen() {
  const { 
    currentData, 
    computedState, 
    simulateTick, 
    triggerSpike, 
    triggerRecovery, 
    history, 
    syncLiveCGM,
    isSimulating 
  } = useHealthStore();

  const { t } = useTranslation();
  const [hubVisible, setHubVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Manual Sim Inputs
  const [simGlucose, setSimGlucose] = useState(Math.round(currentData.glucose).toString());
  const [simHR, setSimHR] = useState(Math.round(currentData.heartRate).toString());



  // Animation for metrics pulse
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedMetricsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  // Auto-AI Logic: Trigger advice when MSI is high
  useEffect(() => {
    if (computedState.msi > 1.8 && !aiLoading) {
        console.log("Detecting High MSI - Triggering Auto-OSAP...");
        handleAutoAdvice();
    }
  }, [computedState.msi]);

  const handleAutoAdvice = async () => {
    setAiLoading(true);
    const adviceResult = await fetchGeminiOSAP(currentData, computedState, history);
    
    // Xử lý nếu adviceResult là object OSAPResponse
    const adviceText = typeof adviceResult === 'string' 
        ? adviceResult 
        : `${adviceResult.currentState}. ${adviceResult.prediction}`;

    const audioUrl = await fetchElevenLabsVoice(adviceText);
    if (audioUrl) {
        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
        await sound.playAsync();
    }
    setAiLoading(false);
  };

  const [activities, setActivities] = useState([
    { id: '1', time: '10:20:05', message: 'System initialized. Waiting for sensor connection...', type: 'info' },
    { id: '2', time: '10:20:10', message: 'Nightscout bridge connected. Fetching latest SGV...', type: 'sync' },
    { id: '3', time: '10:21:45', message: 'AI Analysis: Glucose trend shows high variability.', type: 'ai' },
  ]);

  // Simulate real-time data tick and sync with CGM every 5 seconds

  useEffect(() => {
    const interval = setInterval(() => {
      simulateTick();
      syncLiveCGM();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const glucoseHistory = history.map(h => h.glucose);

  return (
    <SafeAreaView style={styles.container}>
      <LiveStatusHeader onInfoPress={() => setInfoVisible(true)} />

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {isSimulating === 'spike' && (
            <View style={[styles.simBanner, { backgroundColor: THEME.colors.alert }]}>
                <Text style={styles.simBannerText}>⚠️ CẢNH BÁO: ĐANG MÔ PHỎNG ĐỘT BIẾN ĐƯỜNG HUYẾT (SPIKE!)</Text>
            </View>
        )}
        {isSimulating === 'recovery' && (
            <View style={[styles.simBanner, { backgroundColor: THEME.colors.stability }]}>
                <Text style={styles.simBannerText}>✅ ĐANG MÔ PHỎNG QUÁ TRÌNH HỒI PHỤC (RECOVERY...)</Text>
            </View>
        )}

        
        {/* Core 3 Metrics - Premium Pulsating Layout */}
        <Animated.View style={[styles.metricsRow, animatedMetricsStyle]}>
          <MetricCircle 
            title={t('metabolic_overload')} 
            subTitle={t('metabolic_overload_desc')}
            value={computedState.msi} 
            color={THEME.colors.stability} 
            size={90} 
          />
          <MetricCircle 
            title={t('glucose_control')} 
            subTitle={t('glucose_control_desc')}
            value={computedState.mgc} 
            color={THEME.colors.primary} 
            size={130} 
            suffix="%" 
          />
          <MetricCircle 
            title={t('energy_balance')} 
            subTitle={t('energy_balance_desc')}
            value={computedState.eib} 
            color={THEME.colors.energy} 
            size={90} 
          />
        </Animated.View>



        {/* Live Streaming Chart */}
        <View style={styles.rawCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Live Glucose Stream</Text>
            <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveLabel}>{t('live_streaming')}</Text>
            </View>
          </View>
          <LivePulseChart data={glucoseHistory} />
        </View>


        {/* Live Activity Feed */}
        <View style={{ marginBottom: 20 }}>
          <LiveActivityFeed activities={activities} />
        </View>

        {/* Live Raw Data */}
        <View style={styles.rawCard}>
          <Text style={styles.cardTitle}>System Diagnostics</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Glucose</Text>
            <Text style={styles.value}>{Math.round(currentData.glucose)} mg/dL</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t('steps')}</Text>
            <Text style={styles.value}>{currentData.steps}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t('stress')}</Text>
            <Text style={styles.value}>{currentData.stressLevel}/10</Text>
          </View>
        </View>


        {/* Data Input System Hub */}
        <TouchableOpacity style={styles.hubTrigger} onPress={() => setHubVisible(true)}>
            <Text style={styles.hubTriggerText}>+ {t('sync_data').toUpperCase()}</Text>
        </TouchableOpacity>


        {/* Action Simulator */}
        <View style={styles.simulator}>
          <Text style={styles.cardTitle}>Diagnostic Simulator</Text>
          
          <View style={styles.simInputRow}>
            <View style={styles.simInputGroup}>
                <Text style={styles.simLabel}>Glucose</Text>
                <TextInput 
                    style={styles.simInput} 
                    value={simGlucose} 
                    onChangeText={setSimGlucose} 
                    keyboardType="numeric" 
                />
            </View>
            <View style={styles.simInputGroup}>
                <Text style={styles.simLabel}>HR (BPM)</Text>
                <TextInput 
                    style={styles.simInput} 
                    value={simHR} 
                    onChangeText={setSimHR} 
                    keyboardType="numeric" 
                />
            </View>
            <TouchableOpacity 
                style={styles.simSetBtn} 
                onPress={() => {
                    updateBiometrics({ 
                        glucose: parseFloat(simGlucose), 
                        heartRate: parseFloat(simHR) 
                    });
                }}
            >
                <Text style={styles.simSetText}>SET</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: THEME.colors.alert }]} onPress={triggerSpike}>
                <Text style={styles.btnText}>Spike 🍔</Text>
                </TouchableOpacity>
                <Text style={styles.simulatorDesc}>{t('simulate_spike_desc')}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: THEME.colors.stability }]} onPress={triggerRecovery}>
                <Text style={styles.btnText}>Recovery 🏃</Text>
                </TouchableOpacity>
                <Text style={styles.simulatorDesc}>{t('simulate_recovery_desc')}</Text>
            </View>
          </View>
        </View>



        <InputHub visible={hubVisible} onClose={() => setHubVisible(false)} />
        <InfoModal visible={infoVisible} onClose={() => setInfoVisible(false)} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  scroll: { padding: 20, paddingBottom: 50 },
  metricsRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 30,
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 45, 85, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.alert,
    marginRight: 5,
  },
  liveLabel: {
    color: THEME.colors.alert,
    fontSize: 10,
    fontWeight: '900',
  },
  rawCard: { 
    backgroundColor: THEME.colors.surface, 
    padding: 24, 
    borderRadius: 24, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  cardTitle: { 
    color: THEME.colors.primary, 
    fontSize: 14, 
    fontWeight: '900', 
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  label: { color: THEME.colors.textDim, fontSize: 15, fontWeight: '500' },
  value: { color: THEME.colors.text, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  simulator: { 
    backgroundColor: THEME.colors.surface, 
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: THEME.colors.border 
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  btn: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#000', fontWeight: '900', fontSize: 13, textTransform: 'uppercase' },
  hubTrigger: { 
    backgroundColor: THEME.colors.primary, 
    padding: 22, 
    borderRadius: 20, 
    marginBottom: 20, 
    alignItems: 'center', 
    shadowColor: THEME.colors.primary, 
    shadowOpacity: 0.4, 
    shadowRadius: 15,
    elevation: 8,
  },
  hubTriggerText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  hubContainer: { 
    backgroundColor: THEME.colors.surface, 
    padding: 24, 
    borderRadius: 24, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: THEME.colors.border 
  },
  hubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  hubTitle: { color: THEME.colors.text, fontSize: 18, fontWeight: '900' },
  syncBtn: { 
    backgroundColor: 'rgba(0, 240, 255, 0.1)', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: THEME.colors.primary 
  },
  syncBtnText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '900' },
  chipScroll: { marginBottom: 10 },
  chip: { 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    paddingHorizontal: 18, 
    paddingVertical: 12, 
    borderRadius: 14, 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: THEME.colors.border 
  },
  chipText: { color: THEME.colors.textDim, fontSize: 13, fontWeight: '600' },
  simulatorDesc: {
    color: THEME.colors.textDim,
    fontSize: 9,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  simulatorNote: {
    color: THEME.colors.textDim,
    fontSize: 11,
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  simInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 15,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  simInputGroup: {
    flex: 1,
  },
  simLabel: {
    color: THEME.colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  simInput: {
    backgroundColor: THEME.colors.background,
    color: THEME.colors.text,
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  simSetBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
  },
  simSetText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 11,
  },
  simBanner: {

    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  simBannerText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  }
});

