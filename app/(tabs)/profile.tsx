import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { THEME } from '../../src/constants/theme';
import { useHealthStore } from '../../src/store/useHealthStore';

export default function ProfileScreen() {
  const { user, userProfile, updateProfile, setAuth } = useHealthStore();
  
  const [age, setAge] = useState(userProfile.age.toString());
  const [weight, setWeight] = useState(userProfile.weight.toString());

  const handleUpdate = () => {
    updateProfile({
      age: parseInt(age) || userProfile.age,
      weight: parseInt(weight) || userProfile.weight,
    });
    alert('Đã cập nhật thông tin profile!');
  };

  const logout = () => {
    setAuth(null);
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Hồ Sơ & Thiết Lập</Text>
      
      {/* User Info */}
      <View style={styles.userCard}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={{color: THEME.colors.alert, fontWeight: 'bold'}}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin sinh học</Text>
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Tuổi</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
        </View>
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
        </View>
        <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
            <Text style={{color: '#000', fontWeight: 'bold'}}>Lưu thông tin</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Kết nối thiết bị</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Apple Health Sync</Text>
          <Switch value={true} thumbColor={THEME.colors.primary} />
        </View>
        <Text style={styles.hint}>Đã đồng bộ Nhịp tim & Giấc ngủ từ HealthKit</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Dexcom / Nightscout API</Text>
          <Switch value={false} thumbColor={THEME.colors.textDim} />
        </View>
        <TextInput 
            style={[styles.input, {marginTop: 10}]} 
            placeholder="Nhập API URL (ex: https://my.nightscout.io)" 
            placeholderTextColor={THEME.colors.textDim}
        />
        <Text style={styles.hint}>Kết nối CGM tự động trích xuất Glucose</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Mock Data Simulator (MVP)</Text>
          <Switch value={true} thumbColor={THEME.colors.energy} />
        </View>
        <Text style={styles.hint}>Đang kích hoạt Engine Giả lập nội bộ để test</Text>
      </View>
      
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background, padding: 20 },
  header: { color: THEME.colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.surface, padding: 15, borderRadius: 16, marginBottom: 20, gap: 15 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  userName: { color: THEME.colors.text, fontSize: 18, fontWeight: 'bold' },
  userEmail: { color: THEME.colors.textDim, fontSize: 12 },
  logoutBtn: { marginLeft: 'auto', padding: 10 },
  card: { backgroundColor: THEME.colors.surface, padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: THEME.colors.border },
  cardTitle: { color: THEME.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  sectionTitle: { color: THEME.colors.primary, fontSize: 20, fontWeight: 'bold', marginVertical: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  label: { color: THEME.colors.text, fontSize: 14, fontWeight: 'bold' },
  hint: { color: THEME.colors.textDim, fontSize: 12 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  input: { backgroundColor: THEME.colors.background, color: THEME.colors.text, borderRadius: 8, paddingHorizontal: 15, paddingVertical: 8, borderWidth: 1, borderColor: THEME.colors.border, width: '60%' },
  updateBtn: { backgroundColor: THEME.colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 }
});
