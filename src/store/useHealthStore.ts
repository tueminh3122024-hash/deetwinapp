import { create } from 'zustand';
import { BiometricData, ComputedState, HealthEngine } from '../engine/HealthEngine';
import { saveBiometricsToSupabase } from '../services/db';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface UserProfile {
  age: number;
  weight: number;
  height: number;
  targetMGC: number;
}

interface HealthStore {
  user: User | null;
  userProfile: UserProfile;
  currentData: BiometricData;
  computedState: ComputedState;
  history: BiometricData[];
  mealLog: string[];
  cgmConfig: {
    type: 'dexcom' | 'nightscout' | 'manual';
    url?: string;
    username?: string;
    password?: string;
    sessionId?: string;
  };
  setAuth: (user: User | null) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateCGMConfig: (config: Partial<HealthStore['cgmConfig']>) => void;
  addMeal: (meal: string) => void;
  updateBiometrics: (data: Partial<BiometricData>) => void;
  syncWithAppleHealth: () => Promise<void>;
  syncWithAndroidHealth: () => Promise<void>;
  syncLiveCGM: () => Promise<void>;
  language: 'vn' | 'en';
  setLanguage: (lang: 'vn' | 'en') => void;
  toggleLanguage: () => void;
  simulateTick: () => void;
  triggerSpike: () => void;
  triggerRecovery: () => void;
}


const generateBaseline = (): BiometricData => ({
  glucose: 95,
  heartRate: 65,
  hrv: 60,
  sleepScore: 85,
  activityLevel: 10,
  steps: 2000,
  stressLevel: 3,
  timestamp: Date.now(),
});


export const useHealthStore = create<HealthStore>((set, get) => ({
  user: null,
  userProfile: {
    age: 30,
    weight: 70,
    height: 175,
    targetMGC: 90,
  },
  currentData: generateBaseline(),
  computedState: HealthEngine.computeAll(generateBaseline(), null),
  history: [generateBaseline()],
  mealLog: [],
  cgmConfig: { type: 'manual' },
  language: 'vn',


  setAuth: (user) => set({ user }),
  setLanguage: (language) => set({ language }),
  toggleLanguage: () => set((state) => ({ language: state.language === 'vn' ? 'en' : 'vn' })),

  
  updateProfile: (profile) => set((state) => ({ 
    userProfile: { ...state.userProfile, ...profile } 
  })),

  updateCGMConfig: (config) => set((state) => ({
    cgmConfig: { ...state.cgmConfig, ...config }
  })),

  addMeal: (meal) => set((state) => ({
    mealLog: [...state.mealLog, meal],
  })),

  updateBiometrics: (data) => {
    const prev = get().currentData;
    const current = { ...prev, ...data, timestamp: Date.now() };
    const computed = HealthEngine.computeAll(current, prev);
    
    // Sync with cloud if needed
    const user = get().user;
    if (user) {
        saveBiometricsToSupabase(user.id, current, computed);
    }

    set({ currentData: current, computedState: computed });
  },

  simulateTick: () => {
    const prev = get().currentData;
    // adding some random jitter to simulate real-time sensors
    const newGlucose = prev.glucose + (Math.random() * 4 - 2); 
    const newHR = prev.heartRate + (Math.random() * 4 - 2);
    
    const current: BiometricData = {
      ...prev,
      glucose: newGlucose,
      heartRate: newHR,
      timestamp: Date.now(),
    };

    const computed = HealthEngine.computeAll(current, prev);
    
    // Cloud Sync (Supabase) - only if user is logged in
    const user = get().user;
    if (user) {
      saveBiometricsToSupabase(user.id, current, computed);
    }
    
    set((state) => ({
      currentData: current,
      computedState: computed,
      // keep last 50 records for charts
      history: [...state.history.slice(-50), current], 
    }));
  },

  triggerSpike: () => {
    const prev = get().currentData;
    const current: BiometricData = {
      ...prev,
      glucose: prev.glucose + 30, // massive spike
      heartRate: prev.heartRate + 15,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      currentData: current,
      computedState: HealthEngine.computeAll(current, prev),
      history: [...state.history, current],
    }));
  },

  triggerRecovery: () => {
    const prev = get().currentData;
    const current: BiometricData = {
      ...prev,
      glucose: Math.max(90, prev.glucose - 20), // fast drop
      heartRate: Math.max(60, prev.heartRate - 10),
      timestamp: Date.now(),
    };
    
    set((state) => ({
      currentData: current,
      computedState: HealthEngine.computeAll(current, prev),
      history: [...state.history, current],
    }));
  },

  syncLiveCGM: async () => {
    const { type, url, username, password, sessionId } = get().cgmConfig;
    let newValue: number | null = null;

    try {
        if (type === 'nightscout' && url) {
            const { NightscoutService } = await import('../services/cgm/Nightscout');
            const data = await NightscoutService.fetchLatest(url);
            if (data) newValue = data.sgv;
        } else if (type === 'dexcom' && username && password) {
            const { DexcomService } = await import('../services/cgm/DexcomShare');
            let sid = sessionId;
            if (!sid) {
                sid = await DexcomService.login(username, password) || undefined;
                if (sid) get().updateCGMConfig({ sessionId: sid });
            }
            if (sid) {
                newValue = await DexcomService.fetchLatest(sid);
            }
        }

        if (newValue) {
            get().updateBiometrics({ glucose: newValue });
            console.log(`[CGM] Live Sync: ${newValue} mg/dL`);
        }
    } catch (e) {
        console.error('[CGM] Sync Error:', e);
    }
  },

  syncWithAppleHealth: async () => {

      // Import động để tránh lỗi trên Android/Web khi bundle
      const { initHealthKit, getLatestHeartRate, getStepCount, getLatestHRV } = await import('../services/health/appleHealth');
      const { Alert } = await import('react-native');
      
      try {
          await initHealthKit();
          const hr = await getLatestHeartRate();
          const steps = await getStepCount();
          const hrv = await getLatestHRV();

          get().updateBiometrics({
              heartRate: hr,
              steps: steps,
              hrv: hrv
          });
          
          Alert.alert(
            "Đồng bộ thành công",
            "Dữ liệu sức khỏe đã được cập nhật từ hệ thống. (Chế độ mô phỏng nếu chạy trên Expo Go)"
          );
      } catch (e) {
          console.error('[Store] Sync failed', e);
          Alert.alert("Lỗi đồng bộ", "Không thể kết nối với dữ liệu sức khỏe.");
      }
  },

  syncWithAndroidHealth: async () => {
    const { Platform, Alert } = await import('react-native');
    if (Platform.OS !== 'android') return;

    try {
        const { initHealthConnect, getAndroidHeartRate, getAndroidSteps } = await import('../services/health/androidHealth');
        
        const isReady = await initHealthConnect();
        if (isReady) {
            const hr = await getAndroidHeartRate();
            const steps = await getAndroidSteps();

            get().updateBiometrics({
                heartRate: hr,
                steps: steps
            });

            Alert.alert("Thành công", "Đã đồng bộ dữ liệu từ Google Health Connect!");
        } else {
            Alert.alert("Thông báo", "Vui lòng cài đặt ứng dụng Health Connect từ Play Store để sử dụng tính năng này.");
        }
    } catch (e) {
        console.error('[Store] Android Sync Error:', e);
        Alert.alert("Lỗi", "Không thể đồng bộ dữ liệu Android.");
    }
  }
}));
