/*
  # Convert timestamps to Unix epoch format

  1. Changes
    - Convert all timestamp fields to bigint to store Unix epoch timestamps (milliseconds)
    - Update triggers to use epoch timestamps
    - Add helper functions for timestamp conversion
*/

-- Create helper functions for timestamp conversion
CREATE OR REPLACE FUNCTION to_epoch_ms(ts TIMESTAMPTZ) 
RETURNS BIGINT AS $$
BEGIN
  RETURN (EXTRACT(EPOCH FROM ts) * 1000)::BIGINT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION from_epoch_ms(epoch_ms BIGINT) 
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN to_timestamp(epoch_ms / 1000.0);
END;
$$ LANGUAGE plpgsql;

-- Modify users table
ALTER TABLE users 
  ADD COLUMN created_at_epoch BIGINT,
  ADD COLUMN updated_at_epoch BIGINT;

UPDATE users SET 
  created_at_epoch = to_epoch_ms(created_at),
  updated_at_epoch = to_epoch_ms(updated_at);

ALTER TABLE users 
  DROP COLUMN created_at,
  DROP COLUMN updated_at;

ALTER TABLE users 
  RENAME COLUMN created_at_epoch TO created_at;

ALTER TABLE users 
  RENAME COLUMN updated_at_epoch TO updated_at;

-- Modify bio_pages table
ALTER TABLE bio_pages 
  ADD COLUMN created_at_epoch BIGINT,
  ADD COLUMN updated_at_epoch BIGINT;

ALTER TABLE bio_pages 
  ADD COLUMN archived_at_epoch BIGINT;

UPDATE bio_pages SET 
  created_at_epoch = to_epoch_ms(created_at),
  updated_at_epoch = to_epoch_ms(updated_at);

UPDATE bio_pages SET 
  archived_at_epoch = to_epoch_ms(archived_at);

ALTER TABLE bio_pages
  DROP COLUMN created_at,
  DROP COLUMN updated_at;

ALTER TABLE bio_pages
  DROP COLUMN archived_at;

ALTER TABLE bio_pages
  RENAME COLUMN created_at_epoch TO created_at;
ALTER TABLE bio_pages
  RENAME COLUMN updated_at_epoch TO updated_at;
ALTER TABLE bio_pages
  RENAME COLUMN archived_at_epoch TO archived_at;

-- Modify links table
ALTER TABLE links 
  ADD COLUMN created_at_epoch BIGINT,
  ADD COLUMN updated_at_epoch BIGINT,
  ADD COLUMN expires_at_epoch BIGINT;

UPDATE links SET 
  created_at_epoch = to_epoch_ms(created_at),
  updated_at_epoch = to_epoch_ms(updated_at),
  expires_at_epoch = CASE WHEN expires_at IS NOT NULL THEN to_epoch_ms(expires_at) ELSE NULL END;

ALTER TABLE links 
  DROP COLUMN created_at,
  DROP COLUMN updated_at,
  DROP COLUMN expires_at;

ALTER TABLE links
  RENAME COLUMN created_at_epoch TO created_at;
ALTER TABLE links
  RENAME COLUMN updated_at_epoch TO updated_at;
ALTER TABLE links 
  RENAME COLUMN expires_at_epoch TO expires_at;

-- Modify clicks table
ALTER TABLE clicks 
  ADD COLUMN created_at_epoch BIGINT;

UPDATE clicks SET 
  created_at_epoch = to_epoch_ms(created_at);

ALTER TABLE clicks 
  DROP COLUMN created_at;
ALTER TABLE clicks 
  RENAME COLUMN created_at_epoch TO created_at;

-- Modify daily_stats table
ALTER TABLE daily_stats 
  ADD COLUMN date_epoch BIGINT,
  ADD COLUMN created_at_epoch BIGINT,
  ADD COLUMN updated_at_epoch BIGINT;

UPDATE daily_stats SET 
  date_epoch = to_epoch_ms(date),
  created_at_epoch = to_epoch_ms(created_at),
  updated_at_epoch = to_epoch_ms(updated_at);

ALTER TABLE daily_stats 
  DROP COLUMN date,
  DROP COLUMN created_at,
  DROP COLUMN updated_at;
ALTER TABLE daily_stats
  RENAME COLUMN date_epoch TO date;
ALTER TABLE daily_stats
  RENAME COLUMN created_at_epoch TO created_at;
ALTER TABLE daily_stats
  RENAME COLUMN updated_at_epoch TO updated_at;

-- Modify workspaces table
ALTER TABLE workspaces 
  ADD COLUMN created_at_epoch BIGINT,
  ADD COLUMN updated_at_epoch BIGINT;

UPDATE workspaces SET 
  created_at_epoch = to_epoch_ms(created_at),
  updated_at_epoch = to_epoch_ms(updated_at);

ALTER TABLE workspaces 
  DROP COLUMN created_at,
  DROP COLUMN updated_at;

ALTER TABLE workspaces 
  RENAME COLUMN created_at_epoch TO created_at;
ALTER TABLE workspaces
  RENAME COLUMN updated_at_epoch TO updated_at;

-- Modify workspace_members table
ALTER TABLE workspace_members 
  ADD COLUMN created_at_epoch BIGINT;

UPDATE workspace_members SET 
  created_at_epoch = to_epoch_ms(created_at);

ALTER TABLE workspace_members 
  DROP COLUMN created_at;
ALTER TABLE workspace_members 
  RENAME COLUMN created_at_epoch TO created_at;

-- Modify link_tags table
ALTER TABLE link_tags 
  ADD COLUMN created_at_epoch BIGINT;

UPDATE link_tags SET 
  created_at_epoch = to_epoch_ms(created_at);

ALTER TABLE link_tags 
  DROP COLUMN created_at;
ALTER TABLE link_tags
  RENAME COLUMN created_at_epoch TO created_at;

-- Modify link_tag_relations table
ALTER TABLE link_tag_relations 
  ADD COLUMN created_at_epoch BIGINT;

UPDATE link_tag_relations SET 
  created_at_epoch = to_epoch_ms(created_at);

ALTER TABLE link_tag_relations 
  DROP COLUMN created_at;
ALTER TABLE link_tag_relations 
  RENAME COLUMN created_at_epoch TO created_at;

-- Modify link_metadata table
ALTER TABLE link_metadata 
  ADD COLUMN last_checked_at_epoch BIGINT,
  ADD COLUMN created_at_epoch BIGINT,
  ADD COLUMN updated_at_epoch BIGINT;

UPDATE link_metadata SET 
  last_checked_at_epoch = to_epoch_ms(last_checked_at),
  created_at_epoch = to_epoch_ms(created_at),
  updated_at_epoch = to_epoch_ms(updated_at);

ALTER TABLE link_metadata 
  DROP COLUMN last_checked_at,
  DROP COLUMN created_at,
  DROP COLUMN updated_at;
ALTER TABLE link_metadata 
  RENAME COLUMN last_checked_at_epoch TO last_checked_at;
ALTER TABLE link_metadata 
  RENAME COLUMN created_at_epoch TO created_at;
ALTER TABLE link_metadata 
  RENAME COLUMN updated_at_epoch TO updated_at;

-- Modify user_settings table
ALTER TABLE user_settings 
  ADD COLUMN created_at_epoch BIGINT,
  ADD COLUMN updated_at_epoch BIGINT;

UPDATE user_settings SET 
  created_at_epoch = to_epoch_ms(created_at),
  updated_at_epoch = to_epoch_ms(updated_at);

ALTER TABLE user_settings 
  DROP COLUMN created_at,
  DROP COLUMN updated_at;
ALTER TABLE user_settings 
  RENAME COLUMN created_at_epoch TO created_at;
ALTER TABLE user_settings 
  RENAME COLUMN updated_at_epoch TO updated_at;

-- Modify social_links table
ALTER TABLE social_links 
  ADD COLUMN created_at_epoch BIGINT,
  ADD COLUMN updated_at_epoch BIGINT;

UPDATE social_links SET 
  created_at_epoch = to_epoch_ms(created_at),
  updated_at_epoch = to_epoch_ms(updated_at);

ALTER TABLE social_links 
  DROP COLUMN created_at,
  DROP COLUMN updated_at;
ALTER TABLE social_links
  RENAME COLUMN created_at_epoch TO created_at;
ALTER TABLE social_links
  RENAME COLUMN updated_at_epoch TO updated_at;

-- Modify bio_links table
ALTER TABLE bio_links 
  ADD COLUMN created_at_epoch BIGINT,
  ADD COLUMN updated_at_epoch BIGINT;

UPDATE bio_links SET 
  created_at_epoch = to_epoch_ms(created_at),
  updated_at_epoch = to_epoch_ms(updated_at);

ALTER TABLE bio_links 
  DROP COLUMN created_at,
  DROP COLUMN updated_at;
ALTER TABLE bio_links 
  RENAME COLUMN created_at_epoch TO created_at;
ALTER TABLE bio_links 
  RENAME COLUMN updated_at_epoch TO updated_at;

-- Modify visitor_sessions table
ALTER TABLE visitor_sessions 
  ADD COLUMN started_at_epoch BIGINT,
  ADD COLUMN ended_at_epoch BIGINT,
  ADD COLUMN created_at_epoch BIGINT;

UPDATE visitor_sessions SET 
  started_at_epoch = EXTRACT(EPOCH FROM started_at) * 1000,
  ended_at_epoch = CASE WHEN ended_at IS NOT NULL THEN EXTRACT(EPOCH FROM ended_at) * 1000 ELSE NULL END,
  created_at_epoch = EXTRACT(EPOCH FROM created_at) * 1000;

DROP TRIGGER update_visitor_session_duration ON visitor_sessions;

ALTER TABLE visitor_sessions 
  DROP COLUMN started_at,
  DROP COLUMN ended_at,
  DROP COLUMN created_at;
ALTER TABLE visitor_sessions 
  RENAME COLUMN started_at_epoch TO started_at;
ALTER TABLE visitor_sessions 
  RENAME COLUMN ended_at_epoch TO ended_at;
ALTER TABLE visitor_sessions 
  RENAME COLUMN created_at_epoch TO created_at;

CREATE TRIGGER update_visitor_session_duration
  BEFORE UPDATE OF ended_at ON visitor_sessions
  FOR EACH ROW
  WHEN (OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL)
  EXECUTE FUNCTION update_session_duration();

-- Modify visitor_data table
ALTER TABLE visitor_data 
  ADD COLUMN consent_timestamp_epoch BIGINT,
  ADD COLUMN created_at_epoch BIGINT,
  ADD COLUMN updated_at_epoch BIGINT;

UPDATE visitor_data SET 
  consent_timestamp_epoch = CASE WHEN consent_timestamp IS NOT NULL THEN to_epoch_ms(consent_timestamp) ELSE NULL END,
  created_at_epoch = to_epoch_ms(created_at),
  updated_at_epoch = to_epoch_ms(updated_at);

ALTER TABLE visitor_data 
  DROP COLUMN consent_timestamp,
  DROP COLUMN created_at,
  DROP COLUMN updated_at;
ALTER TABLE visitor_data 
  RENAME COLUMN consent_timestamp_epoch TO consent_timestamp;
ALTER TABLE visitor_data 
  RENAME COLUMN created_at_epoch TO created_at;
ALTER TABLE visitor_data 
  RENAME COLUMN updated_at_epoch TO updated_at;

-- Modify geolocation_data table
ALTER TABLE geolocation_data 
  ADD COLUMN created_at_epoch BIGINT;

UPDATE geolocation_data SET 
  created_at_epoch = to_epoch_ms(created_at);

ALTER TABLE geolocation_data 
  DROP COLUMN created_at;
ALTER TABLE geolocation_data 
  RENAME COLUMN created_at_epoch TO created_at;

-- Update the update_updated_at function to use epoch timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = to_epoch_ms(NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the update_session_duration function to use epoch timestamps
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Convert epoch timestamps to seconds and calculate duration
  NEW.duration = (NEW.ended_at / 1000) - (NEW.started_at / 1000);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to use epoch timestamps
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_workspace_id uuid;
  current_epoch BIGINT;
BEGIN
  -- Get current epoch timestamp
  current_epoch := to_epoch_ms(NOW());

  -- Create user profile
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    current_epoch,
    current_epoch
  );

  -- Create default user settings
  INSERT INTO public.user_settings (
    user_id,
    theme,
    language,
    timezone,
    notification_preferences,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    'light',
    COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
    '{"email": true, "push": false}'::jsonb,
    current_epoch,
    current_epoch
  );

  -- Create default workspace
  INSERT INTO public.workspaces (
    name,
    slug,
    description,
    owner_id,
    created_at,
    updated_at
  )
  VALUES (
    'Personal Workspace',
    'personal-' || lower(regexp_replace(NEW.email, '[^a-zA-Z0-9]', '-', 'g')),
    'My personal workspace',
    NEW.id,
    current_epoch,
    current_epoch
  )
  RETURNING id INTO default_workspace_id;

  -- Add user to workspace members
  INSERT INTO public.workspace_members (
    workspace_id,
    user_id,
    role,
    created_at
  )
  VALUES (
    default_workspace_id,
    NEW.id,
    'owner',
    current_epoch
  );

  -- Create default bio page
  INSERT INTO public.bio_pages (
    username,
    title,
    description,
    theme,
    user_id,
    workspace_id,
    visibility,
    created_at,
    updated_at
  )
  VALUES (
    lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)) || '''s Bio',
    'Welcome to my bio page!',
    'default',
    NEW.id,
    default_workspace_id,
    'public',
    current_epoch,
    current_epoch
  );

  RETURN NEW;
END;
$$;