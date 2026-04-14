/**
 * Dexcom Share API Service (Unofficial)
 * Regions: US (share2.dexcom.com) or OUS (shareous1.dexcom.com)
 */

export class DexcomService {
  private static US_URL = 'https://share2.dexcom.com/ShareWebServices/Services';
  private static OUS_URL = 'https://shareous1.dexcom.com/ShareWebServices/Services';

  static async login(username: string, password: string, ous: boolean = true): Promise<string | null> {
    const baseUrl = ous ? this.OUS_URL : this.US_URL;
    try {
      const response = await fetch(`${baseUrl}/General/LoginPublisherAccountByName`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          accountName: username,
          password: password,
          applicationId: 'd89443d2-327c-4a6f-89e5-496bbb0317db', // Official Dexcom App ID
        }),
      });
      const sessionId = await response.json();
      return sessionId; // UUID string
    } catch (error) {
      console.error('[Dexcom] Login Error:', error);
      return null;
    }
  }

  static async fetchLatest(sessionId: string, ous: boolean = true): Promise<number | null> {
    const baseUrl = ous ? this.OUS_URL : this.US_URL;
    try {
      const response = await fetch(`${baseUrl}/Publisher/ReadPublisherLatestGlucoseValues?sessionId=${sessionId}&minutes=1440&maxCount=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': '0' },
      });
      const data = await response.json();
      if (data && data.length > 0) {
        return data[0].Value;
      }
      return null;
    } catch (error) {
      console.error('[Dexcom] Fetch Error:', error);
      return null;
    }
  }
}
