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
  const cameraRef = React.useRef<any>(null);

  if (!visible) return null;

  if (!permission) return <View />;

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

  const handleCapture = async () => {
    if (!cameraRef.current || scanning) return;
    
    setScanning(true);
    try {
        const photo = await cameraRef.current.takePictureAsync({
            base64: true,
            quality: 0.5,
        });
        
        const { analyzeBiometricImage } = await import('../services/ai');
        const results = await analyzeBiometricImage(photo.base64);
        
        if (results.glucose) {
            onResult(results.glucose);
            onClose();
        } else {
            alert("Không tìm thấy chỉ số. Vui lòng căn lề rõ nét hơn.");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi AI Vision. Vui lòng thử lại.");
    } finally {
        setScanning(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade">
      <View style={styles.container}>
        <CameraView 
            ref={cameraRef}
            style={styles.camera} 
            facing="back"
        >
          <View style={styles.overlay}>
            <View style={styles.scanTarget} />
            <Text style={styles.hint}> Căn lề thiết bị hoặc giấy tờ y tế vào khung hình </Text>
          </View>
        </CameraView>
        
        <View style={styles.controls}>
          {scanning ? (
            <ActivityIndicator color={THEME.colors.primary} size="large" />
          ) : (
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
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
