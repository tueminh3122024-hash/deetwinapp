export interface GlucoseEntry {
  sgv: number;
  date: number;
  direction?: string;
}

export class NightscoutService {
  static async fetchLatest(url: string): Promise<GlucoseEntry | null> {
    try {
      const endpoint = `${url.replace(/\/$/, '')}/api/v1/entries/sgv.json?count=1`;
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const entry = data[0];
        return {
          sgv: entry.sgv,
          date: entry.date,
          direction: entry.direction,
        };
      }
      return null;
    } catch (error) {
      console.error('[Nightscout] Fetch Error:', error);
      return null;
    }
  }
}

