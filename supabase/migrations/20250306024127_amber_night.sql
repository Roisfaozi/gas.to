/*
  # Add UTM parameters to clicks table

  1. Changes
    - Add utm_term and utm_content columns to clicks table
    - Add function to get link statistics
*/

-- Add new UTM columns
ALTER TABLE clicks
ADD COLUMN IF NOT EXISTS utm_term text,
ADD COLUMN IF NOT EXISTS utm_content text;

-- Create or replace function to get link statistics
CREATE OR REPLACE FUNCTION get_link_stats(
  p_link_id uuid,
  p_start_date bigint DEFAULT NULL,
  p_end_date bigint DEFAULT NULL
)
RETURNS TABLE (
  total_clicks bigint,
  unique_visitors bigint,
  browser_stats jsonb,
  device_stats jsonb,
  country_stats jsonb,
  utm_stats jsonb,
  daily_clicks jsonb
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_clicks AS (
    SELECT *
    FROM clicks
    WHERE link_id = p_link_id
    AND (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date)
  ),
  browser_count AS (
    SELECT 
      browser,
      COUNT(*) as count
    FROM filtered_clicks
    GROUP BY browser
  ),
  device_count AS (
    SELECT 
      device,
      COUNT(*) as count
    FROM filtered_clicks
    GROUP BY device
  ),
  country_count AS (
    SELECT 
      country,
      COUNT(*) as count
    FROM filtered_clicks
    GROUP BY country
  ),
  utm_count AS (
    SELECT 
      jsonb_build_object(
        'sources', jsonb_object_agg(COALESCE(utm_source, 'direct'), source_count),
        'mediums', jsonb_object_agg(COALESCE(utm_medium, 'none'), medium_count),
        'campaigns', jsonb_object_agg(COALESCE(utm_campaign, 'none'), campaign_count),
        'terms', jsonb_object_agg(COALESCE(utm_term, 'none'), term_count),
        'contents', jsonb_object_agg(COALESCE(utm_content, 'none'), content_count)
      ) as utm_stats
    FROM (
      SELECT 
        utm_source,
        COUNT(*) as source_count,
        utm_medium,
        COUNT(*) as medium_count,
        utm_campaign,
        COUNT(*) as campaign_count,
        utm_term,
        COUNT(*) as term_count,
        utm_content,
        COUNT(*) as content_count
      FROM filtered_clicks
      GROUP BY utm_source, utm_medium, utm_campaign, utm_term, utm_content
    ) utm_data
  ),
  daily_count AS (
    SELECT 
      date_trunc('day', to_timestamp(created_at / 1000))::date as click_date,
      COUNT(*) as count
    FROM filtered_clicks
    GROUP BY click_date
    ORDER BY click_date
  )
  SELECT
    COUNT(*)::bigint as total_clicks,
    COUNT(DISTINCT visitor_id)::bigint as unique_visitors,
    jsonb_object_agg(COALESCE(b.browser, 'unknown'), b.count) as browser_stats,
    jsonb_object_agg(COALESCE(d.device, 'unknown'), d.count) as device_stats,
    jsonb_object_agg(COALESCE(c.country, 'unknown'), c.count) as country_stats,
    COALESCE((SELECT utm_stats FROM utm_count), '{}'::jsonb) as utm_stats,
    jsonb_object_agg(dc.click_date::text, dc.count) as daily_clicks
  FROM filtered_clicks fc
  LEFT JOIN browser_count b ON true
  LEFT JOIN device_count d ON true
  LEFT JOIN country_count c ON true
  LEFT JOIN daily_count dc ON true
  GROUP BY true;
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clicks_utm_params ON clicks (utm_source, utm_medium, utm_campaign, utm_term, utm_content);