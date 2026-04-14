import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Switch } from 'react-native';
import { THEME } from '../constants/theme';
import { useHealthStore } from '../store/useHealthStore';
import { OCRScanner } from './OCRScanner';
import * as DocumentPicker from 'expo-document-picker';
import { DataImporter } from '../services/import/DataImporter';
import * as FileSystem from 'expo-file-system';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const InputHub: React.FC<Props> = ({ visible, onClose }) => {
  const { updateBiometrics, addMeal, currentData, cgmConfig, updateCGMConfig } = useHealthStore();
  const [tab, setTab] = useState<'manual' | 'health' | 'cgm'>('manual');
  
  // States for inputs
  const [glucose, setGlucose] = useState(currentData.glucose.toString());
  const [sleep, setSleep] = useState(currentData.sleepScore.toString());
  const [stress, setStress] = useState(currentData.stressLevel.toString());
  const [meal, setMeal] = useState('');
  
  // CGM Config States
  const [nsUrl, setNsUrl] = useState(cgmConfig.url || '');
  const [dxUsername, setDxUsername] = useState(cgmConfig.username || '');
  const [dxPassword, setDxPassword] = useState(cgmConfig.password || '');
  const [ocrVisible, setOcrVisible] = useState(false);

  const handleSaveManual = () => {
    updateBiometrics({
      glucose: parseFloat(glucose) || currentData.glucose,
      sleepScore: parseFloat(sleep) || currentData.sleepScore,
      stressLevel: parseFloat(stress) || currentData.stressLevel,
    });
    if (meal) {
      addMeal(meal);
      setMeal('');
    }
    onClose();
  };

  const handleSaveCGM = () => {
    if (tab === 'cgm') {
      updateCGMConfig({
        type: nsUrl ? 'nightscout' : (dxUsername ? 'dexcom' : 'manual'),
        url: nsUrl,
        username: dxUsername,
        password: dxPassword,
      });
      alert('Đã lưu cấu hình CGM. Hệ thống sẽ bắt đầu streaming live!');
    }
    onClose();
  };

  const handleBulkImport = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/json', 'text/csv'],
            copyToCacheDirectory: true
        });

        if (result.canceled) return;
        const file = result.assets[0];
        let content = '';

        if (Platform.OS === 'web') {
            const response = await fetch(file.uri);
            content = await response.text();
        } else {
            content = await FileSystem.readAsStringAsync(file.uri);
        }

        const data = file.name.endsWith('.json') 
            ? DataImporter.parseJSON(content) 
            : DataImporter.parseCSV(content);

        if (data.length > 0) {
            data.forEach(item => updateBiometrics(item));
            alert(`Thành công! Đã đồng bộ ${data.length} bản ghi sức khỏe.`);
        } else {
            alert('Không tìm thấy dữ liệu hợp lệ trong tệp này.');
        }
    } catch (e) {
        console.error('Import Error:', e);
        alert('Lỗi khi tải tệp: ' + e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.hubContainer}>
          <View style={styles.hubHeader}>
            <Text style={styles.hubTitle}>DATA CONTROL HUB</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>CANCEL</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabBar}>
            <TabItem label="MANUAL" active={tab === 'manual'} onPress={() => setTab('manual')} />
            <TabItem label="HEALTH" active={tab === 'health'} onPress={() => setTab('health')} />
            <TabItem label="LIVE CGM" active={tab === 'cgm'} onPress={() => setTab('cgm')} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {tab === 'manual' && (
              <View>
                <Text style={styles.sectionLabel}>No-device Quick Input</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Glucose (mg/dL)</Text>
                  <TextInput style={styles.input} value={glucose} onChangeText={setGlucose} keyboardType="numeric" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Meal Description</Text>
                  <TextInput 
                    style={[styles.input, { height: 80 }]} 
                    value={meal} 
                    onChangeText={setMeal} 
                    multiline 
                    placeholder="Bạn vừa ăn gì?"
                    placeholderTextColor={THEME.colors.textDim}
                  />
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveManual}>
                  <Text style={styles.saveBtnText}>LƯU DỮ LIỆU</Text>
                </TouchableOpacity>
              </View>
            )}

            {tab === 'health' && (
              <View>
                <Text style={styles.sectionLabel}>Sync & Bulk Import</Text>
                
                {/* Real-time Sync */}
                <View style={styles.configCard}>
                    <Text style={styles.subLabel}>AUTO-SYNC (MOBILE ONLY)</Text>
                    <Text style={styles.infoText}>Đồng bộ dữ liệu từ Apple Watch hoặc Samsung Health của bạn qua Native Bridge.</Text>
                    <TouchableOpacity style={[styles.saveBtn, { backgroundColor: THEME.colors.primary, marginTop: 15 }]}>
                        <Text style={styles.saveBtnText}>ENABLE NATIVE SYNC</Text>
                    </TouchableOpacity>
                </View>

                {/* Bulk Import */}
                <View style={[styles.configCard, { marginTop: 20 }]}>
                    <Text style={styles.subLabel}>BULK DATA IMPORT (WEB/EXPORT APPS)</Text>
                    <Text style={styles.infoText}>Sync metrics từ app "Data Export", "Samsung Health" hoặc "Apple Health" qua tệp JSON/CSV.</Text>
                    <TouchableOpacity style={[styles.saveBtn, { backgroundColor: THEME.colors.energy, marginTop: 15 }]} onPress={handleBulkImport}>
                        <Text style={styles.saveBtnText}>UPLOAD JSON / CSV FILE</Text>
                    </TouchableOpacity>
                </View>
              </View>
            )}

            {tab === 'cgm' && (
              <View>
                <Text style={styles.sectionLabel}>Streaming Integration</Text>
                
                <View style={styles.configCard}>
                  <Text style={styles.subLabel}>NIGHTSCOUT RE-SYNC</Text>
                  <TextInput 
                    style={styles.input} 
                    value={nsUrl} 
                    onChangeText={setNsUrl} 
                    placeholder="https://yourname.nightscout.io"
                    placeholderTextColor={THEME.colors.textDim}
                  />
                  <Text style={styles.infoText}>Dành cho người dùng Abbott Libre hoặc các giải pháp DIY.</Text>
                </View>

                <View style={[styles.configCard, { marginTop: 15 }]}>
                  <Text style={styles.subLabel}>DEXCOM SHARE (DIRECT)</Text>
                  <TextInput 
                    style={styles.input} 
                    value={dxUsername} 
                    onChangeText={setDxUsername} 
                    placeholder="Dexcom Username"
                    placeholderTextColor={THEME.colors.textDim}
                  />
                  <TextInput 
                    style={[styles.input, { marginTop: 10 }]} 
                    value={dxPassword} 
                    onChangeText={setDxPassword} 
                    placeholder="Password"
                    secureTextEntry
                    placeholderTextColor={THEME.colors.textDim}
                  />
                </View>

                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: THEME.colors.primary, marginTop: 20 }]} onPress={handleSaveCGM}>
                  <Text style={styles.saveBtnText}>BẮT ĐẦU LIVE STREAMING</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.scanBtn} onPress={() => setOcrVisible(true)}>
                    <Text style={styles.saveBtnText}>📷 QUÉT ẢNH CẢM BIẾN (OCR)</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      
      <OCRScanner 
        visible={ocrVisible} 
        onClose={() => setOcrVisible(false)} 
        onResult={(val) => { setGlucose(val.toString()); setTab('manual'); }} 
      />
    </Modal>
  );
};

const TabItem = ({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) => (
  <TouchableOpacity style={[styles.tab, active && styles.activeTab]} onPress={onPress}>
    <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(4,5,12,0.9)', justifyContent: 'flex-end' },
  hubContainer: { backgroundColor: THEME.colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', padding: 24, borderWidth: 1, borderColor: THEME.colors.border },
  hubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  hubTitle: { color: THEME.colors.primary, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  closeBtn: { color: THEME.colors.alert, fontWeight: '900', fontSize: 12 },
  tabBar: { flexDirection: 'row', backgroundColor: THEME.colors.background, borderRadius: 16, padding: 6, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: THEME.colors.primary },
  tabText: { color: THEME.colors.textDim, fontWeight: '900', fontSize: 11 },
  activeTabText: { color: '#000' },
  scrollContent: { paddingBottom: 50 },
  sectionLabel: { color: THEME.colors.text, fontSize: 20, fontWeight: '900', marginBottom: 20 },
  subLabel: { color: THEME.colors.primary, fontSize: 12, fontWeight: '900', marginBottom: 10, letterSpacing: 1 },
  inputGroup: { marginBottom: 20 },
  label: { color: THEME.colors.textDim, fontSize: 12, marginBottom: 8, fontWeight: '700' },
  input: { backgroundColor: THEME.colors.background, color: THEME.colors.text, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: THEME.colors.border, fontSize: 16 },
  saveBtn: { backgroundColor: THEME.colors.stability, padding: 20, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowColor: THEME.colors.stability, shadowOpacity: 0.3, shadowRadius: 10 },
  saveBtnText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  configCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: THEME.colors.border },
  infoText: { color: THEME.colors.textDim, fontSize: 11, marginTop: 10, fontStyle: 'italic' },
  scanBtn: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: THEME.colors.border },
});
