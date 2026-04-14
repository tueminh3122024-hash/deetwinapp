/**
 * Dexcom & Nightscout CGM Sync Service
 */

export interface CGMData {
  glucose: number;
  trend: string;
  source: 'Dexcom' | 'Nightscout' | 'Manual';
  lastUpdated: string;
}

export class CGMService {
  /**
   * Sync from Nightscout API
   */
  static async syncNightscout(url: string): Promise<CGMData | null> {
    if (!url) return null;
    try {
      // Endpoint chuẩn của Nightscout
      const endpoint = `${url}/api/v1/entries/current`;
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data && data.length > 0) {
        return {
          glucose: data[0].sgv,
          trend: data[0].direction,
          source: 'Nightscout',
          lastUpdated: new Date(data[0].date).toISOString()
        };
      }
      return null;
    } catch (err) {
      console.error("Nightscout Sync Failed:", err);
      return null;
    }
  }

  /**
   * Dexcom Sandbox Sync (Place-holder for OAuth2)
   */
  static async syncDexcomSandbox(): Promise<CGMData> {
    // Giả lập dữ liệu từ Dexcom API
    return {
      glucose: 105,
      trend: 'Flat',
      source: 'Dexcom',
      lastUpdated: new Date().toISOString()
    };
  }
}
