export interface BiometricData {
  glucose: number; // mg/dL
  heartRate: number; // bpm
  hrv: number; // ms
  sleepScore: number; // 0-100
  activityLevel: number; // 0-100
  steps: number; // count
  stressLevel: number; // 1-10
  timestamp: number; // epoch ms
}

export interface ComputedState {
  mfv: number; // Metabolic Fluctuation Velocity
  eib: number; // Energy Intensity Balance
  msi: number; // Metabolic Stability Index (MFV / EIB)
  mgc: number; // Metabolic Glucose Control
}

export class HealthEngine {
  // Compute MFV (absolute change in glucose over time)
  static computeMFV(currentGlucose: number, previousGlucose: number, dtMinutes: number = 5): number {
    if (dtMinutes === 0) return 0;
    return Math.abs((currentGlucose - previousGlucose) / dtMinutes);
  }

  // Compute EIB (Base Capacity - Metabolic Penalty)
  static computeEIB(sleepScore: number, activityLevel: number, hrv: number, stressLevel: number): number {
    const baseCapacity = (sleepScore * 0.4) + (hrv * 0.6); 
    const metabolicPenalty = (activityLevel * 0.3) + (stressLevel * 2); // Stress drops energy
    return Math.max(0, baseCapacity - metabolicPenalty);
  }

  // Compute MSI (MFV / EIB)
  static computeMSI(mfv: number, eib: number): number {
    if (eib === 0) return mfv; // Prevent division by zero
    return mfv / eib;
  }

  // Compute MGC (Metabolic Glucose Control - higher is better, 0-100)
  static computeMGC(glucose: number, msi: number): number {
    // Ideal glucose is ~90. Penalty for deviating from 90.
    const deviation = Math.abs(glucose - 90);
    const score = 100 - (deviation * 0.5) - (msi * 10);
    return Math.max(0, Math.min(100, score));
  }

  static computeAll(current: BiometricData, prev: BiometricData | null): ComputedState {
    const mfv = prev ? this.computeMFV(current.glucose, prev.glucose) : 0;
    const eib = this.computeEIB(current.sleepScore, current.activityLevel, current.hrv, current.stressLevel);
    const msi = this.computeMSI(mfv, eib);
    const mgc = this.computeMGC(current.glucose, msi);

    return { mfv, eib, msi, mgc };
  }
}
