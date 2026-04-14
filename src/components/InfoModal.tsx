import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<Props> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>HƯỚNG DẪN CHỈ SỐ</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={THEME.colors.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Section 
                title="📊 STABILITY (MSI)" 
                desc="Chỉ số Quá tải chuyển hóa. < 1.2 là lý tưởng. > 1.8 là báo động quá tải do thức ăn hoặc stress." 
                color={THEME.colors.stability}
            />
            <Section 
                title="🔋 ENERGY (EIB)" 
                desc="Số dư năng lượng cơ thể. Giúp bạn biết mình còn bao nhiêu 'pin' cho các hoạt động trong ngày." 
                color={THEME.colors.energy}
            />
            <Section 
                title="🎯 CONTROL (MGC)" 
                desc="Khả năng kiểm soát đường huyết. Đánh giá độ nhạy Insulin và hiệu quả chuyển hóa Glucose." 
                color={THEME.colors.primary}
            />
            <Section 
                title="📈 LIVE GLUCOSE STREAM" 
                desc="Dòng dữ liệu trực tiếp từ cảm biến. AI sẽ phân tích xu hướng và dự báo Spike trước khi nó xảy ra." 
                color="#fff"
            />
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>ĐÃ HIỂU</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const Section = ({ title, desc, color }: { title: string, desc: string, color: string }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    <Text style={styles.sectionDesc}>{desc}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  container: { backgroundColor: THEME.colors.surface, borderRadius: 32, padding: 25, maxHeight: '80%', borderWidth: 1, borderColor: THEME.colors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: THEME.colors.primary, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  content: { marginBottom: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 8 },
  sectionDesc: { color: THEME.colors.textDim, fontSize: 13, lineHeight: 20 },
  closeBtn: { backgroundColor: THEME.colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  closeBtnText: { color: '#000', fontWeight: '900', fontSize: 14 }
});
