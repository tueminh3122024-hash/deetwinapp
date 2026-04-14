import { ComputedState, BiometricData } from '../engine/HealthEngine';

let cachedModel: string | null = null;

// Rút gọn OSAP xuống 2 phần chính theo yêu cầu
export interface OSAPResponse {
  currentState: string;
  prediction: string;
}

export interface FoodAdviceResponse {
  suggestions: { name: string; desc: string; tag: string }[];
  avoid: { name: string; desc: string; tag: string }[];
}


export async function fetchGeminiOSAP(
  current: BiometricData, 
  state: ComputedState, 
  history: BiometricData[] = []
): Promise<OSAPResponse | string> {
  const GEMINI_API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
  
  if (!GEMINI_API_KEY) {
    return "Lỗi: Không tìm thấy API Key.";
  }

  if (!cachedModel) {
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        const bestModel = listData.models?.find((m: any) => m.name.includes('flash') || m.name.includes('pro'));
        if (bestModel) cachedModel = bestModel.name;
      }
    } catch (e) {}
  }

  const modelNameToUse = cachedModel || "models/gemini-1.5-flash";

  const prompt = `Bạn là DeeTwin AI.
NHIỆM VỤ: Trả về duy nhất 1 đối tượng JSON bên dưới. KHÔNG VIẾT GÌ THÊM.

DỮ LIỆU:
- CHỈ SỐ MỨC ĐỘ QUÁ TẢI: ${state.msi.toFixed(2)}
- MỨC NĂNG LƯỢNG CƠ THỂ: ${state.eib.toFixed(2)}
- Đường huyết: ${Math.round(current.glucose)}

ĐỊNH DẠNG TRẢ VỀ (Bắt buộc):
{
  "currentState": "Đánh giá hiện trạng thấu hiểu (2-3 câu).",
  "prediction": "Dự báo khích lệ (2-3 câu)."
}

LƯU Ý: Không dùng từ tiếng Anh. Sử dụng các thuật ngữ Tiếng Việt đã nêu.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/${modelNameToUse}:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
            temperature: 0.8, 
            maxOutputTokens: 600,
            responseMimeType: "application/json",
            responseSchema: {
               type: "OBJECT",
               properties: {
                 currentState: { type: "STRING" },
                 prediction: { type: "STRING" }
               },
               required: ["currentState", "prediction"]
            }
        }
      })
    });
    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Lỗi giao tiếp với máy chủ AI (Mã lỗi: " + res.status + ")");
    }
    
    const data = await res.json();
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    const cleanJSONStr = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {
        const parsed = JSON.parse(cleanJSONStr);
        if (parsed.currentState && parsed.prediction) return parsed;
        throw new Error("Dữ liệu thiếu trường bắt buộc");
    } catch (e: any) {
        console.warn("JSON Parse Failed, using direct text. Error:", e.message, "Raw:", rawText);
        return {
            currentState: "Hệ thống đang phục hồi dữ liệu từ cảm biến...",
            prediction: "Thuật toán dự đoán tạm thời bị vô hiệu hóa. "
        };
    }
  } catch (error: any) {

    console.error("AI Error:", error.message);
    return `Lỗi hệ thống AI: ${error.message}`;
  }
}


export async function fetchElevenLabsVoice(text: string): Promise<string | null> {
  const API_KEY = "09c10e4cde74de20eb214b7371aac2786696de72148d6b97caddb293abe982a5";
  const VOICE_ID = "A5w1fw5x0uXded1LDvZp"; 
  
  // HÀM LỌC SIÊU SẠCH (Việt hóa hoàn toàn thuật ngữ)
  const sanitize = (input: string) => {
    return input
      .replace(/\{[\s\S]*\}/g, '')
      .replace(/["'{}[\],:]/g, ' ')
      .replace(/currentState/gi, '')
      .replace(/prediction/gi, '')
      .replace(/MSI/gi, 'chỉ số mức độ quá tải')
      .replace(/EIB/gi, 'mức năng lượng cơ thể')
      .replace(/MFV/gi, 'mức độ biến động đường huyết')
      .replace(/MGC/gi, 'khả năng kiểm soát đường huyết')
      .replace(/mg\/dL/gi, 'mi li gam')
      .replace(/[#*]/g, '')
      .trim();
  };

  const cleanText = sanitize(text);

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY,
        "accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { 
            stability: 0.7, 
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
        }
      })
    });
    
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    return null;
  }
}

export async function fetchGeminiFoodAdvice(
  current: BiometricData,
  state: ComputedState,
  lang: 'vn' | 'en' = 'vn'
): Promise<FoodAdviceResponse> {
  const GEMINI_API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
  if (!GEMINI_API_KEY) throw new Error("API Key missing");

  // Re-use model selection logic
  if (!cachedModel) {
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        const bestModel = listData.models?.find((m: any) => m.name.includes('flash') || m.name.includes('pro'));
        if (bestModel) cachedModel = bestModel.name;
      }
    } catch (e) {}
  }

  const modelNameToUse = cachedModel || "models/gemini-1.5-flash";

  const prompt = `Bạn là chuyên gia dinh dưỡng DeeTwin AI. 
NHIỆM VỤ: Dựa trên chỉ số sinh trắc để gợi ý món ăn LOW-CARB (cả món Việt và món Âu).
TRẢ VỀ DUY NHẤT JSON.

DỮ LIỆU:
- MSI (Quá tải): ${state.msi.toFixed(2)}
- Glucose: ${current.glucose} mg/dL
- Trạng thái: ${state.msi > 1.5 ? 'QUÁ TẢI' : 'ỔN ĐỊNH'}

YÊU CẦU:
1. Tập trung vào thực phẩm LOW-CARB, ổn định đường huyết.
2. Gợi ý 2 món nên ăn (suggestions) và 2 món nên tránh (avoid).
3. Đa dạng món Việt và Âu.
4. Ngôn ngữ: ${lang === 'vn' ? 'Tiếng Việt' : 'English'}.
5. Sử dụng thuật ngữ chuyên môn dễ hiểu.

ĐỊNH DẠNG:
{
  "suggestions": [{ "name": "Tên món", "desc": "Lý do (1 câu ngắn)", "tag": "Loại" }],
  "avoid": [{ "name": "Tên món", "desc": "Lý do (1 câu ngắn)", "tag": "Lưu ý" }]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/${modelNameToUse}:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.7,
            responseSchema: {
               type: "OBJECT",
               properties: {
                 suggestions: {
                   type: "ARRAY",
                   items: {
                     type: "OBJECT",
                     properties: {
                       name: { type: "STRING" },
                       desc: { type: "STRING" },
                       tag: { type: "STRING" }
                     },
                     required: ["name", "desc", "tag"]
                   }
                 },
                 avoid: {
                   type: "ARRAY",
                   items: {
                     type: "OBJECT",
                     properties: {
                       name: { type: "STRING" },
                       desc: { type: "STRING" },
                       tag: { type: "STRING" }
                     },
                     required: ["name", "desc", "tag"]
                   }
                 }
               },
               required: ["suggestions", "avoid"]
            }
        }
      })
    });
    
    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Lỗi AI");
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    const cleanJSONStr = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleanJSONStr);
  } catch (e: any) {

    console.error("Food AI Error:", e.message);
    return {
        suggestions: [{ name: "Lỗi kết nối bộ não AI", desc: e.message, tag: "Error" }],
        avoid: [{ name: "Không thể lấy dữ liệu", desc: "Vui lòng kiểm tra lại cấu hình API Key.", tag: "Error" }]
    };
  }
}


export async function analyzeBiometricImage(base64Image: string): Promise<Partial<BiometricData>> {
  const GEMINI_API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
  if (!GEMINI_API_KEY) throw new Error("API Key missing");

  const prompt = `Bạn là trợ lý giải mã dữ liệu y tế. 
NHIỆM VỤ: Đọc ảnh (có thể là máy đo đường huyết, kết quả xét nghiệm bệnh viện, hoặc nhật ký viết tay).
TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON.

CÁC CHỈ SỐ CẦN TÌM:
- glucose (mg/dL hoặc mmol/L - tự quy đổi sang mg/dL nếu là mmol/L bằng cách nhân 18)
- heartRate (nhịp tim - bpm)
- steps (bước chân)
- stressLevel (mức độ căng thẳng 1-10)

ĐỊNH DẠNG TRẢ VỀ:
{
  "glucose": number,
  "heartRate": number,
  "steps": number,
  "stressLevel": number
}
(Chỉ điền các trường tìm thấy dữ liệu).`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    return JSON.parse(rawText);
  } catch (e) {
    console.error("Vision AI Error:", e);
    return {};
  }
}



