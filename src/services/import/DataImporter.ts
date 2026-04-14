import { BiometricData } from '../../engine/HealthEngine';

export class DataImporter {
  /**
   * Parse JSON export from apps like 'Health Auto Export'
   */
  static parseJSON(jsonString: string): Partial<BiometricData>[] {
    try {
      const data = JSON.parse(jsonString);
      const results: Partial<BiometricData>[] = [];

      // Logic for Health Auto Export (Standard JSON)
      if (data.data && Array.isArray(data.data.metrics)) {
        data.data.metrics.forEach((metric: any) => {
            const timestamp = new Date(metric.start).getTime();
            const value = metric.data[0]?.value;

            if (metric.name === 'blood_glucose') {
                results.push({ glucose: value, timestamp });
            } else if (metric.name === 'heart_rate') {
                results.push({ heartRate: value, timestamp });
            } else if (metric.name === 'step_count') {
                results.push({ steps: value, timestamp });
            }
        });
      }

      return results;
    } catch (e) {
      console.error('[DataImporter] JSON Parse Error:', e);
      return [];
    }
  }

  /**
   * Parse CSV export from Samsung Health or Apple Health
   */
  static parseCSV(csvString: string): Partial<BiometricData>[] {
    try {
        const lines = csvString.split('\n');
        const headers = lines[0].split(',');
        const results: Partial<BiometricData>[] = [];

        // Basic CSV Parsing (Example: Date,Metric,Value)
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length < 3) continue;

            const timestamp = new Date(cols[0]).getTime();
            const metric = cols[1].toLowerCase();
            const value = parseFloat(cols[2]);

            if (metric.includes('glucose')) {
                results.push({ glucose: value, timestamp });
            } else if (metric.includes('step')) {
                results.push({ steps: Math.floor(value), timestamp });
            }
        }
        return results;
    } catch (e) {
        console.error('[DataImporter] CSV Parse Error:', e);
        return [];
    }
  }
}

