import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { THEME } from '../../src/constants/theme';
import { useHealthStore } from '../../src/store/useHealthStore';

export default function FoodScreen() {
  const { computedState, currentData } = useHealthStore();

  const isStress = computedState.msi > 1.5 || currentData.stressLevel > 7;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.header}>Smart Food Engine 🍽️</Text>
        <Text style={styles.status}>
          Trạng thái: {isStress ? '⚠️ Đang Stress Chuyển Hóa' : '✅ Đang Ổn Định'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Suggested Meals (Nên ăn)</Text>
        {isStress ? (
          <View>
            <FoodCard 
                name="Salad Cá Hồi & Bơ" 
                desc="Giàu Omega-3 và chất xơ, giúp hạ chỉ số MSI ngay lập tức." 
                tag="Low GI" 
            />
            <FoodCard 
                name="Yến mạch & Quả mọng" 
                desc="Năng lượng giải phóng chậm, ổn định đường huyết." 
                tag="Recovery" 
            />
          </View>
        ) : (
          <View>
            <FoodCard 
                name="Cơm Gạo Lứt & Ức Gà" 
                desc="Cân bằng đạm và carb để duy trì pin năng lượng (EIB)." 
                tag="Balanced" 
            />
            <FoodCard 
                name="Trứng Luộc & Rau Xanh" 
                desc="Tối ưu hóa khả năng kiểm soát đường huyết (MGC)." 
                tag="Stability" 
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: THEME.colors.alert }]}>❌ Avoid Foods (Cần tránh)</Text>
        {isStress ? (
          <View>
             <FoodCard 
                name="Trà Sữa / Nước Ngọt" 
                desc="Gây Spike đường huyết cực mạnh, làm MSI tồi tệ hơn." 
                tag="Danger" 
            />
            <FoodCard 
                name="Bánh Mì Trắng / Pizza" 
                desc="Carb nhanh sẽ làm hỏng khả năng hồi phục của bạn." 
                tag="High Spike" 
            />
          </View>
        ) : (
          <View>
            <FoodCard 
                name="Đồ Chiên Rán" 
                desc="Làm giảm độ nhạy insulin trong dài hạn." 
                tag="Limit" 
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const FoodCard = ({ name, desc, tag }: { name: string, desc: string, tag: string }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.foodName}>{name}</Text>
      <View style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
    </View>
    <Text style={styles.foodDesc}>{desc}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  headerBox: { padding: 25, backgroundColor: THEME.colors.surface, marginBottom: 20 },
  header: { color: THEME.colors.primary, fontSize: 28, fontWeight: 'bold' },
  status: { color: THEME.colors.textDim, marginTop: 5 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: { color: THEME.colors.stability, fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: THEME.colors.surface, padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: THEME.colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  foodName: { color: THEME.colors.text, fontSize: 18, fontWeight: 'bold' },
  tag: { backgroundColor: THEME.colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  foodDesc: { color: THEME.colors.textDim, fontSize: 14, lineHeight: 20 }
});
