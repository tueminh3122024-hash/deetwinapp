import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../../src/constants/theme';
import { useHealthStore } from '../../src/store/useHealthStore';

export default function AnalyticsScreen() {
  const { history, computedState } = useHealthStore();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Detail Analytics</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>7 Core Metrics (Bảng thông số Lõi)</Text>
        <MetricRow label="1. Glucose" value={`${Math.round(history[history.length - 1]?.glucose || 90)} mg/dL`} />
        <MetricRow label="2. Heart Rate" value={`${Math.round(history[history.length - 1]?.heartRate || 60)} bpm`} />
        <MetricRow label="3. HRV" value={`${history[history.length - 1]?.hrv || 60} ms`} />
        <MetricRow label="4. Sleep" value={`${history[history.length - 1]?.sleepScore || 85} / 100`} />
        <MetricRow label="5. Steps" value={history[history.length - 1]?.steps?.toString() || "0"} />
        <MetricRow label="6. Stress Level" value={`${history[history.length - 1]?.stressLevel || 3}/10`} />
        <MetricRow label="7. Energy (EIB)" value={computedState.eib.toFixed(2)} />
        <MetricRow label="8. Stability (MSI)" value={computedState.msi.toFixed(2)} />
        
        <View style={{marginTop: 10, backgroundColor: 'rgba(0,255,102,0.1)', padding: 10, borderRadius: 5}}>
          <MetricRow label="G. Control (MGC)" value={`${Math.round(computedState.mgc)}%`} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Glucose Trend Log (mg/dL)</Text>
        <View style={styles.graphBox}>
          {history.length > 0 ? history.map((log, index) => (
             <View key={index} style={[styles.bar, { height: Math.max(1, log.glucose - 60) * 1.5 }, log.glucose > 130 && {backgroundColor: THEME.colors.alert}]} />
          )) : <Text style={{color: THEME.colors.textDim}}>Đang chờ dữ liệu...</Text>}
        </View>
        <Text style={styles.hint}>Biểu đồ mô phỏng đường huyết 50 bản ghi gần nhất. Màu đỏ khi Spike.</Text>
      </View>
    </ScrollView>
  );
}

const MetricRow = ({label, value}: {label: string, value: string}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background, padding: 20 },
  header: { color: THEME.colors.primary, fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: THEME.colors.surface, padding: 20, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: THEME.colors.border },
  cardTitle: { color: THEME.colors.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  label: { color: THEME.colors.textDim, fontSize: 16 },
  value: { color: THEME.colors.text, fontSize: 16, fontWeight: 'bold' },
  graphBox: { flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: 4, overflow: 'hidden' },
  bar: { width: 5, backgroundColor: THEME.colors.energy },
  hint: { color: THEME.colors.textDim, fontSize: 12, marginTop: 10, fontStyle: 'italic' }
});
