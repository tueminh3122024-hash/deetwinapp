import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
} from 'react-native-health-connect';
import { Platform } from 'react-native';

export const initHealthConnect = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;

  try {
    const status = await getSdkStatus();
    if (status === 1) { // 1 = SdkStatus.SDK_UNAVAILABLE (Phụ thuộc version thư viện)
      console.warn('[HealthConnect] SDK Unavailable');
      return false;
    }

    const isInitialized = await initialize();
    if (!isInitialized) {
        console.warn('[HealthConnect] Failed to initialize');
        return false;
    }

    // Request permissions
    await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'HeartRate' },
      { accessType: 'read', recordType: 'SleepSession' },
    ]);

    return true;
  } catch (error) {
    console.error('[HealthConnect] Init Error:', error);
    return false;
  }
};

export const getAndroidHeartRate = async (): Promise<number> => {
  try {
    const now = new Date();
    const startTime = new Date(now.getTime() - 30 * 60 * 1000).toISOString(); // 30 mins ago
    const endTime = now.toISOString();

    const response = await readRecords('HeartRate', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = (response as any).records || [];

    if (records.length > 0) {
      const lastRecord = records[records.length - 1];
      if (lastRecord.samples && lastRecord.samples.length > 0) {
          return lastRecord.samples[lastRecord.samples.length - 1].beatsPerMinute;
      }
    }
    return 72; // Fallback
  } catch (error) {
    console.error('[HealthConnect] Read HR Error:', error);
    return 72;
  }
};

export const getAndroidSteps = async (): Promise<number> => {
  try {
    const now = new Date();
    const startTime = new Date(now.setHours(0, 0, 0, 0)).toISOString(); // Start of today
    const endTime = new Date().toISOString();

    const response = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = (response as any).records || [];
    return records.reduce((acc: number, cur: any) => acc + (cur.count || 0), 0);
  } catch (error) {
    console.error('[HealthConnect] Read Steps Error:', error);
    return 0;
  }
};
