/*
  # Improve database schema

  1. New Tables
    - `link_tags` - For categorizing links
    - `link_metadata` - For storing additional link information
    - `user_settings` - For user preferences and settings
    - `workspaces` - For organizing links into groups/projects
    - `workspace_members` - For workspace collaboration

  2. Enhancements
    - Add tags support for links
    - Add metadata fields for better link management
    - Add workspace support for team collaboration
    - Add user settings and preferences
    - Add better analytics support
    - Improve indexes for better performance

  3. Security
    - Add RLS policies for new tables
    - Enhance existing RLS policies
*/

-- Create enum types for better data consistency
CREATE TYPE link_type AS ENUM ('shortlink', 'bio');
CREATE TYPE link_status AS ENUM ('active', 'disabled', 'expired', 'deleted');
CREATE TYPE visibility_type AS ENUM ('public', 'private', 'team');

-- Add workspace support
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Add link tags support
CREATE TABLE IF NOT EXISTS link_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#000000',
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, workspace_id)
);

CREATE TABLE IF NOT EXISTS link_tag_relations (
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES link_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (link_id, tag_id)
);

-- Add link metadata
CREATE TABLE IF NOT EXISTS link_metadata (
  link_id UUID PRIMARY KEY REFERENCES links(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  image_url TEXT,
  favicon_url TEXT,
  domain TEXT,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance existing tables

-- Add new columns to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE links ADD COLUMN IF NOT EXISTS type link_type DEFAULT 'shortlink';
ALTER TABLE links ADD COLUMN IF NOT EXISTS status link_status DEFAULT 'active';
ALTER TABLE links ADD COLUMN IF NOT EXISTS visibility visibility_type DEFAULT 'public';
ALTER TABLE links ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS click_limit INTEGER;
ALTER TABLE links ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Add new columns to clicks table
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS screen_resolution TEXT;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS is_unique BOOLEAN DEFAULT true;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS visit_duration INTEGER;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- Add new columns to bio_pages table
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS visibility visibility_type DEFAULT 'public';
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS social_image_url TEXT;
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS custom_css TEXT;
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS custom_html TEXT;
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Add new indexes for better performance
CREATE INDEX IF NOT EXISTS links_workspace_created_idx ON links(workspace_id, created_at);
CREATE INDEX IF NOT EXISTS links_status_idx ON links(status);
CREATE INDEX IF NOT EXISTS links_type_idx ON links(type);
CREATE INDEX IF NOT EXISTS clicks_workspace_created_idx ON clicks(workspace_id, created_at);
CREATE INDEX IF NOT EXISTS clicks_session_idx ON clicks(session_id);
CREATE INDEX IF NOT EXISTS clicks_is_unique_idx ON clicks(is_unique);
CREATE INDEX IF NOT EXISTS bio_pages_workspace_created_idx ON bio_pages(workspace_id, created_at);

-- Enable RLS on new tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspaces
CREATE POLICY "Users can view workspaces they are members of" ON workspaces
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can update their workspaces" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can delete their workspaces" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for workspace members
CREATE POLICY "Workspace owners can manage members" ON workspace_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Members can view workspace members" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

-- Create RLS policies for link tags
CREATE POLICY "Users can manage tags in their workspaces" ON link_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = link_tags.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Create RLS policies for link metadata
CREATE POLICY "Users can manage metadata for their links" ON link_metadata
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_metadata.link_id
      AND links.user_id = auth.uid()
    )
  );

-- Create RLS policies for user settings
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION get_link_stats(
  p_link_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_clicks BIGINT,
  unique_clicks BIGINT,
  countries JSON,
  browsers JSON,
  devices JSON,
  referrers JSON
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_clicks,
    COUNT(DISTINCT session_id)::BIGINT as unique_clicks,
    COALESCE(
      json_object_agg(country, country_count)
      FILTER (WHERE country IS NOT NULL),
      '{}'::json
    ) as countries,
    COALESCE(
      json_object_agg(browser, browser_count)
      FILTER (WHERE browser IS NOT NULL),
      '{}'::json
    ) as browsers,
    COALESCE(
      json_object_agg(device_type, device_count)
      FILTER (WHERE device_type IS NOT NULL),
      '{}'::json
    ) as devices,
    COALESCE(
      json_object_agg(referer, referer_count)
      FILTER (WHERE referer IS NOT NULL),
      '{}'::json
    ) as referrers
  FROM (
    SELECT
      country,
      COUNT(*) as country_count,
      browser,
      COUNT(*) as browser_count,
      device_type,
      COUNT(*) as device_count,
      referer,
      COUNT(*) as referer_count
    FROM clicks
    WHERE
      link_id = p_link_id
      AND created_at >= p_start_date
      AND created_at <= p_end_date
    GROUP BY country, browser, device_type, referer
  ) stats;
END;
$$;