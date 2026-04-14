-- KÍCH HOẠT LƯU TRỮ DỮ LIỆU THẬT CHO DEETWIN
-- Hướng dẫn: Coppy toàn bộ nội dung bên dưới, dán vào phần "SQL Editor" trong Supabase và nhấn "Run".

-- 1. Tạo bảng lưu trữ chỉ số sinh học
CREATE TABLE IF NOT EXISTS public.biometrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    glucose FLOAT8,
    heart_rate FLOAT8,
    hrv FLOAT8,
    sleep_score FLOAT8,
    activity_level FLOAT8,
    msi FLOAT8,
    eib FLOAT8,
    mgc FLOAT8,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 2. Bật Row Level Security (Bảo mật dữ liệu cá nhân)
ALTER TABLE public.biometrics ENABLE ROW LEVEL SECURITY;

-- 3. Cho phép người dùng chỉ xem và thêm dữ liệu của chính mình
DROP POLICY IF EXISTS "Users can insert their own biometrics" ON public.biometrics;
CREATE POLICY "Users can insert their own biometrics" 
ON public.biometrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own biometrics" ON public.biometrics;
CREATE POLICY "Users can view their own biometrics" 
ON public.biometrics FOR SELECT 
USING (auth.uid() = user_id);


-- 4. Tạo Index để truy vấn nhanh hơn cho biểu đồ
CREATE INDEX IF NOT EXISTS biometrics_user_timestamp_idx ON public.biometrics (user_id, timestamp DESC);
