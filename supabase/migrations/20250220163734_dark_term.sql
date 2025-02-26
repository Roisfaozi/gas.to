/*
  # Initial Schema Setup

  1. Tables Created
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - name (text, nullable)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - links
      - id (uuid, primary key)
      - short_code (text, unique)
      - original_url (text)
      - title (text, nullable)
      - created_at (timestamp)
      - updated_at (timestamp)
      - user_id (uuid, foreign key)
      - bio_page_id (uuid, foreign key, nullable)
      - is_active (boolean)
      - expires_at (timestamp, nullable)
    
    - bio_pages
      - id (uuid, primary key)
      - username (text, unique)
      - title (text)
      - description (text, nullable)
      - theme (text)
      - created_at (timestamp)
      - updated_at (timestamp)
      - user_id (uuid, foreign key)
    
    - clicks
      - id (uuid, primary key)
      - created_at (timestamp)
      - link_id (uuid, foreign key)
      - ip (text, nullable)
      - city (text, nullable)
      - country (text, nullable)
      - device (text, nullable)
      - browser (text, nullable)
      - os (text, nullable)
      - referer (text, nullable)
      - user_agent (text, nullable)
    
    - daily_stats
      - id (uuid, primary key)
      - date (date, unique)
      - total_clicks (integer)
      - unique_clicks (integer)
      - new_links (integer)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - RLS policies for all tables
    - Authentication using Supabase Auth
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bio_pages table
CREATE TABLE bio_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

-- Create links table
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_code TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bio_page_id UUID REFERENCES bio_pages(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ
);

-- Create clicks table
CREATE TABLE clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  ip TEXT,
  city TEXT,
  country TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  referer TEXT,
  user_agent TEXT
);

-- Create daily_stats table
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  new_links INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX clicks_link_id_created_at_idx ON clicks(link_id, created_at);
CREATE INDEX clicks_country_created_at_idx ON clicks(country, created_at);
CREATE INDEX clicks_device_created_at_idx ON clicks(device, created_at);
CREATE INDEX clicks_browser_created_at_idx ON clicks(browser, created_at);
CREATE INDEX clicks_os_created_at_idx ON clicks(os, created_at);
CREATE INDEX daily_stats_date_idx ON daily_stats(date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own bio pages" ON bio_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bio pages" ON bio_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bio pages" ON bio_pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bio pages" ON bio_pages
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own links" ON links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" ON links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON links
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can read active links" ON links
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can read own clicks" ON clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = clicks.link_id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert clicks" ON clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read daily stats" ON daily_stats
  FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bio_pages_updated_at
  BEFORE UPDATE ON bio_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_stats_updated_at
  BEFORE UPDATE ON daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();