/*
  # Enhanced Visitor Analytics

  1. New Tables
    - `visitor_sessions` - Stores unique visitor session data
      - `id` (uuid, primary key)
      - `visitor_id` (uuid) - Unique identifier for returning visitors
      - `fingerprint` (text) - Browser fingerprint hash
      - `started_at` (timestamp)
      - `ended_at` (timestamp)
      - `duration` (integer) - Session duration in seconds
      - `is_returning` (boolean)
      - `created_at` (timestamp)
    
    - `visitor_data` - Stores detailed visitor information
      - `id` (uuid, primary key)
      - `visitor_id` (uuid) - Links to visitor sessions
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `consent_given` (boolean)
      - `consent_timestamp` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `geolocation_data` - Stores visitor location data
      - `id` (uuid, primary key)
      - `session_id` (uuid) - References visitor_sessions
      - `latitude` (float)
      - `longitude` (float)
      - `accuracy` (float)
      - `city` (text)
      - `region` (text)
      - `country` (text)
      - `postal_code` (text)
      - `consent_given` (boolean)
      - `created_at` (timestamp)

  2. Enhanced Clicks Table
    - Add additional tracking fields to the existing clicks table
    - Add session tracking capabilities

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create visitor_sessions table
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL,
  fingerprint TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration INTEGER,
  is_returning BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create visitor_data table
CREATE TABLE IF NOT EXISTS visitor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create geolocation_data table
CREATE TABLE IF NOT EXISTS geolocation_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES visitor_sessions(id) ON DELETE CASCADE,
  latitude FLOAT,
  longitude FLOAT,
  accuracy FLOAT,
  city TEXT,
  region TEXT,
  country TEXT,
  postal_code TEXT,
  consent_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to clicks table
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS visitor_session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS visitor_id UUID;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS screen_size TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS screen_resolution TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS fingerprint TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS visitor_sessions_visitor_id_idx ON visitor_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS visitor_sessions_fingerprint_idx ON visitor_sessions(fingerprint);
CREATE INDEX IF NOT EXISTS visitor_data_visitor_id_idx ON visitor_data(visitor_id);
CREATE INDEX IF NOT EXISTS geolocation_data_session_id_idx ON geolocation_data(session_id);
CREATE INDEX IF NOT EXISTS clicks_session_id_idx ON clicks(session_id);
CREATE INDEX IF NOT EXISTS clicks_visitor_id_idx ON clicks(visitor_id);
CREATE INDEX IF NOT EXISTS clicks_fingerprint_idx ON clicks(fingerprint);

-- Enable Row Level Security
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolocation_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read visitor sessions for their links" ON visitor_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clicks
      JOIN links ON clicks.link_id = links.id
      WHERE clicks.visitor_session_id = visitor_sessions.id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read visitor data for their links" ON visitor_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clicks
      JOIN links ON clicks.link_id = links.id
      WHERE clicks.visitor_session_id = visitor_data.visitor_id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read geolocation data for their links" ON geolocation_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM visitor_sessions
      JOIN clicks ON clicks.visitor_session_id = visitor_sessions.id
      JOIN links ON clicks.link_id = links.id
      WHERE geolocation_data.session_id = visitor_sessions.id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert visitor sessions" ON visitor_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert visitor data" ON visitor_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert geolocation data" ON geolocation_data
  FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_visitor_data_updated_at
  BEFORE UPDATE ON visitor_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create function to update session duration
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.duration = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session duration
CREATE TRIGGER update_visitor_session_duration
  BEFORE UPDATE OF ended_at ON visitor_sessions
  FOR EACH ROW
  WHEN (OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL)
  EXECUTE FUNCTION update_session_duration();

