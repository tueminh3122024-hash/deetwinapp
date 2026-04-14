-- DeeTwin Database Setup - Run this in Supabase SQL Editor

-- 1. Create Biometrics Table
CREATE TABLE IF NOT EXISTS biometrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    glucose NUMERIC,
    heart_rate NUMERIC,
    hrv NUMERIC,
    sleep_score NUMERIC,
    activity_level NUMERIC,
    msi NUMERIC,
    eib NUMERIC,
    mgc NUMERIC,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE biometrics ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can only see their own data
DROP POLICY IF EXISTS "Users can view their own biometrics" ON biometrics;
CREATE POLICY "Users can view their own biometrics" 
ON biometrics FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert their own data
DROP POLICY IF EXISTS "Users can insert their own biometrics" ON biometrics;
CREATE POLICY "Users can insert their own biometrics" 
ON biometrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Create Indexes for performance
CREATE INDEX IF NOT EXISTS biometrics_user_id_idx ON biometrics(user_id);
CREATE INDEX IF NOT EXISTS biometrics_timestamp_idx ON biometrics(timestamp);

-- 5. Helper: User Profile Metadata Trigger (Optional but recommended)
-- This ensures user settings can be synced across devices
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    age INT,
    weight FLOAT,
    height FLOAT,
    target_mgc FLOAT DEFAULT 90,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

