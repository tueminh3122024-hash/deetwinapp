import { supabase } from '../lib/supabase';
import { BiometricData } from '../engine/HealthEngine';
import { ComputedState } from '../engine/HealthEngine';

let tableErrorLogged = false;

export async function saveBiometricsToSupabase(
  userId: string, 
  current: BiometricData, 
  state: ComputedState
) {
  try {
    const { error } = await supabase
      .from('biometrics')
      .insert([
        {
          user_id: userId,
          glucose: current.glucose,
          heart_rate: current.heartRate,
          hrv: current.hrv,
          sleep_score: current.sleepScore,
          activity_level: current.activityLevel,
          msi: state.msi,
          eib: state.eib,
          mgc: state.mgc,
          timestamp: new Date(current.timestamp).toISOString(),
        },
      ]);

    if (error) {
        // Chỉ log lỗi bảng chưa tồn tại một lần duy nhất để tránh spam console
        if (error.code === 'PGRST116' || error.message.includes('schema cache')) {
            if (!tableErrorLogged) {
                console.warn("⚠️ Supabase: Chưa tìm thấy bảng 'biometrics'. Bạn hãy chạy lệnh SQL trong implementation_plan.md để kích hoạt tính năng lưu dữ liệu nhé.");
                tableErrorLogged = true;
            }
            return;
        }
        console.error('Supabase Save Error:', error.message);
    }
  } catch (err) {
    console.error('Database Connection Error:', err);
  }
}
