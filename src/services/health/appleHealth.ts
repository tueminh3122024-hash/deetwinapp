import { Platform } from 'react-native';

// Chúng ta sử dụng require để tránh crash khi thư viện native không tồn tại trong Expo Go
let AppleHealthKit: any = null;
try {
  if (Platform.OS === 'ios') {
    AppleHealthKit = require('react-native-health').default;
  }
} catch (e) {
  console.log('[Native] AppleHealthKit not available in this environment (likely Expo Go).');
}

export const initHealthKit = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!AppleHealthKit || Platform.OS !== 'ios') {
      console.log('[HealthKit] Mode: Simulation (Expo Go)');
      return resolve();
    }

    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.HeartRate,
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.HeartRateVariability,
        ],
        write: [],
      },
    };

    AppleHealthKit.initHealthKit(permissions, (error: any) => {
      if (error) {
        console.warn('[HealthKit] Initialization failed:', error);
      }
      resolve();
    });
  });
};

export const getLatestHeartRate = (): Promise<number> => {
  return new Promise((resolve) => {
    if (!AppleHealthKit) {
        // Giả lập dữ liệu nhịp tim khi chạy trên Expo Go
        return resolve(72 + Math.floor(Math.random() * 10 - 5));
    }

    const options = {
        unit: 'bpm',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };

    AppleHealthKit.getHeartRateSamples(options, (err: any, results: any) => {
      if (err || !results || results.length === 0) return resolve(70);
      resolve(results[0].value);
    });
  });
};

export const getStepCount = (): Promise<number> => {
  return new Promise((resolve) => {
    if (!AppleHealthKit) {
        // Giả lập số bước khi chạy trên Expo Go
        return resolve(5432 + Math.floor(Math.random() * 100));
    }

    const options = {
      date: new Date().toISOString(),
    };

    AppleHealthKit.getStepCount(options, (err: any, results: any) => {
      if (err || !results) return resolve(0);
      resolve(results.value);
    });
  });
};

export const getLatestHRV = (): Promise<number> => {
    return new Promise((resolve) => {
      if (!AppleHealthKit) {
          // Giả lập HRV khi chạy trên Expo Go
          return resolve(48 + Math.floor(Math.random() * 5));
      }

      const options = {
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      };
      
      if (AppleHealthKit.getHeartRateVariabilitySamples) {
          AppleHealthKit.getHeartRateVariabilitySamples(options, (err: any, results: any) => {
              if (err || !results || results.length === 0) return resolve(45);
              resolve(results[0].value * 1000);
          });
      } else {
          resolve(45);
      }
    });
};
