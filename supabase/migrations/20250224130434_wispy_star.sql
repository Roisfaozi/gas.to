/*
  # Bio Page Improvements

  1. New Tables
    - `social_links`: Store social media links for bio pages
    - `bio_links`: Store web links for bio pages
  
  2. Changes to bio_pages
    - Add profile_image_url column
    - Add theme_config column for storing theme settings
    - Remove custom_css and custom_html columns
*/

-- Create social_links table
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_page_id UUID REFERENCES bio_pages(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bio_page_id, platform)
);

-- Create bio_links table
CREATE TABLE IF NOT EXISTS bio_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_page_id UUID REFERENCES bio_pages(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add profile image and theme config to bio_pages
ALTER TABLE bio_pages 
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{"name": "default", "colors": {"primary": "#4F46E5", "text": "#111827", "background": "#FFFFFF"}}'::jsonb;

-- Drop custom CSS and HTML columns
ALTER TABLE bio_pages 
  DROP COLUMN IF EXISTS custom_css,
  DROP COLUMN IF EXISTS custom_html;

-- Create indexes
CREATE INDEX IF NOT EXISTS social_links_bio_page_id_idx ON social_links(bio_page_id);
CREATE INDEX IF NOT EXISTS bio_links_bio_page_id_idx ON bio_links(bio_page_id);
CREATE INDEX IF NOT EXISTS bio_links_sort_order_idx ON bio_links(sort_order);

-- Enable RLS
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for social_links
CREATE POLICY "Users can manage their bio page social links" ON social_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM bio_pages
      WHERE bio_pages.id = social_links.bio_page_id
      AND bio_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view social links" ON social_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bio_pages
      WHERE bio_pages.id = social_links.bio_page_id
      AND bio_pages.visibility = 'public'
    )
  );

-- Create RLS policies for bio_links
CREATE POLICY "Users can manage their bio page links" ON bio_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM bio_pages
      WHERE bio_pages.id = bio_links.bio_page_id
      AND bio_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view bio links" ON bio_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bio_pages
      WHERE bio_pages.id = bio_links.bio_page_id
      AND bio_pages.visibility = 'public'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_social_links_updated_at
  BEFORE UPDATE ON social_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bio_links_updated_at
  BEFORE UPDATE ON bio_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();