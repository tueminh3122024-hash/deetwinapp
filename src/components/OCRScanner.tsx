import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { THEME } from '../constants/theme';

interface OCRScannerProps {
  visible: boolean;
  onClose: () => void;
  onResult: (value: number) => void;
}

export const OCRScanner: React.FC<OCRScannerProps> = ({ visible, onClose, onResult }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  if (!visible) return null;

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.text}>Chúng tôi cần quyền truy cập Camera để quét chỉ số.</Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Cấp quyền Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const simulateOCR = () => {
    setScanning(true);
    // Trong thực tế, đây là nơi gọi Google Vision API hoặc Tesseract
    // MVP: Giả lập quá trình quét sau 2 giây
    setTimeout(() => {
        const fakeValue = Math.floor(Math.random() * (140 - 90 + 1)) + 90;
        onResult(fakeValue);
        setScanning(false);
        onClose();
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="fade">
      <View style={styles.container}>
        <CameraView style={styles.camera} facing="back">
          <View style={styles.overlay}>
            <View style={styles.scanTarget} />
            <Text style={styles.hint}> Căn lề con số trên máy đo vào khung hình </Text>
          </View>
        </CameraView>
        
        <View style={styles.controls}>
          {scanning ? (
            <ActivityIndicator color={THEME.colors.primary} size="large" />
          ) : (
            <TouchableOpacity style={styles.captureBtn} onPress={simulateOCR}>
                <View style={styles.captureInner} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, width: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanTarget: { width: 250, height: 150, borderWidth: 2, borderColor: THEME.colors.primary, borderRadius: 12, backgroundColor: 'transparent' },
  hint: { color: '#fff', marginTop: 20, fontSize: 16, textAlign: 'center' },
  controls: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: THEME.colors.primary },
  closeBtn: { marginTop: 30 },
  closeBtnText: { color: '#fff', fontSize: 16 },
  text: { color: '#fff', textAlign: 'center', padding: 20 },
  btn: { backgroundColor: THEME.colors.primary, padding: 15, borderRadius: 10 },
  btnText: { color: '#000', fontWeight: 'bold' }
});
