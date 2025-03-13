/*
  # Fix Analytics Data Handling

  1. Changes
    - Update get_link_stats function to properly handle date ranges
    - Add proper aggregation for analytics data
    - Fix UTM parameter tracking
    - Add proper indexing for performance

  2. Indexes
    - Add indexes on commonly queried columns
    - Add composite indexes for date ranges
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_link_stats;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS clicks_created_at_idx ON clicks(created_at);
CREATE INDEX IF NOT EXISTS clicks_link_id_idx ON clicks(link_id);
CREATE INDEX IF NOT EXISTS clicks_link_id_created_at_idx ON clicks(link_id, created_at);

-- Create the improved get_link_stats function
CREATE OR REPLACE FUNCTION get_link_stats(
  p_link_id UUID,
  p_start_date BIGINT DEFAULT NULL,
  p_end_date BIGINT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSON;
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
BEGIN
  -- Convert epoch timestamps to timestamptz
  IF p_start_date IS NOT NULL THEN
    v_start_date := to_timestamp(p_start_date::double precision / 1000);
  END IF;
  
  IF p_end_date IS NOT NULL THEN
    v_end_date := to_timestamp(p_end_date::double precision / 1000);
  END IF;

  WITH filtered_clicks AS (
    SELECT *
    FROM clicks
    WHERE link_id = p_link_id
    AND (
      (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date)
    )
  ),
  daily_clicks AS (
    SELECT 
      DATE_TRUNC('day', to_timestamp(created_at::double precision / 1000)) AS click_date,
      COUNT(*) as click_count
    FROM filtered_clicks
    GROUP BY DATE_TRUNC('day', to_timestamp(created_at::double precision / 1000))
  ),
  browser_stats AS (
    SELECT browser, COUNT(*) as count
    FROM filtered_clicks
    WHERE browser IS NOT NULL
    GROUP BY browser
  ),
  device_stats AS (
    SELECT device, COUNT(*) as count
    FROM filtered_clicks
    WHERE device IS NOT NULL
    GROUP BY device
  ),
  country_stats AS (
    SELECT country, COUNT(*) as count
    FROM filtered_clicks
    WHERE country IS NOT NULL
    GROUP BY country
  ),
  utm_source_stats AS (
    SELECT utm_source, COUNT(*) as count
    FROM filtered_clicks
    WHERE utm_source IS NOT NULL
    GROUP BY utm_source
  ),
  utm_medium_stats AS (
    SELECT utm_medium, COUNT(*) as count
    FROM filtered_clicks
    WHERE utm_medium IS NOT NULL
    GROUP BY utm_medium
  ),
  utm_campaign_stats AS (
    SELECT utm_campaign, COUNT(*) as count
    FROM filtered_clicks
    WHERE utm_campaign IS NOT NULL
    GROUP BY utm_campaign
  ),
  utm_term_stats AS (
    SELECT utm_term, COUNT(*) as count
    FROM filtered_clicks
    WHERE utm_term IS NOT NULL
    GROUP BY utm_term
  ),
  utm_content_stats AS (
    SELECT utm_content, COUNT(*) as count
    FROM filtered_clicks
    WHERE utm_content IS NOT NULL
    GROUP BY utm_content
  )
  SELECT json_build_object(
    'total_clicks', (SELECT COUNT(*) FROM filtered_clicks),
    'unique_visitors', (SELECT COUNT(DISTINCT visitor_id) FROM filtered_clicks),
    'browser_stats', (
      SELECT json_object_agg(browser, count)
      FROM browser_stats
    ),
    'device_stats', (
      SELECT json_object_agg(device, count)
      FROM device_stats
    ),
    'country_stats', (
      SELECT json_object_agg(country, count)
      FROM country_stats
    ),
    'utm_stats', json_build_object(
      'sources', (SELECT json_object_agg(utm_source, count) FROM utm_source_stats),
      'mediums', (SELECT json_object_agg(utm_medium, count) FROM utm_medium_stats),
      'campaigns', (SELECT json_object_agg(utm_campaign, count) FROM utm_campaign_stats),
      'terms', (SELECT json_object_agg(utm_term, count) FROM utm_term_stats),
      'contents', (SELECT json_object_agg(utm_content, count) FROM utm_content_stats)
    ),
    'daily_clicks', (
      SELECT json_object_agg(
        to_char(click_date, 'YYYY-MM-DD'),
        click_count
      )
      FROM daily_clicks
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;