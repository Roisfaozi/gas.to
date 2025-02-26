/*
  # Auth Triggers and Functions

  1. New Functions
    - `handle_new_user()` - Creates user profile and related records
    - `handle_user_deletion()` - Cleans up user data on deletion

  2. New Triggers
    - `on_auth_user_created` - Trigger for new user creation
    - `on_auth_user_deleted` - Trigger for user deletion

  3. Security
    - Functions execute with security definer
    - Restricted to authenticated users only
*/

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_workspace_id uuid;
BEGIN
  -- Create user profile
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
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
    NOW(),
    NOW()
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
    NOW(),
    NOW()
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
    NOW()
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
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Create a function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete user profile and all related data
  -- (Most cascades are handled by foreign key constraints)
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for user deletion
CREATE OR REPLACE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_deletion TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_user_deletion TO service_role;