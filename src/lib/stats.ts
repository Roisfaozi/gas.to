import { supabase } from './supabase/client'

export async function getLinkStats(
  linkId: string,
  startDate?: number,
  endDate?: number
) {
  try {
    const { data, error } = await supabase.rpc('get_link_stats', {
      p_link_id: linkId,
      p_start_date: startDate,
      p_end_date: endDate,
    })

    if (error) {
      console.error('Error calling get_link_stats:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error getting link stats:', error)
    throw error
  }
}

export async function getBioPageStats(
  bioPageId: string,
  startDate?: number,
  endDate?: number
) {
  try {
    // First get all links associated with this bio page
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('id')
      .eq('bio_page_id', bioPageId)

    if (linksError) {
      console.error('Error getting bio page links:', linksError)
      throw linksError
    }

    // Get stats for each link
    const linkIds = links?.map((link) => link.id) || []
    const statsPromises = linkIds.map((id) =>
      getLinkStats(id, startDate, endDate)
    )

    const allStats = await Promise.all(statsPromises)

    // Aggregate stats across all links
    return allStats.reduce(
      (acc, stats) => ({
        total_clicks: (acc.total_clicks || 0) + (stats.total_clicks || 0),
        unique_visitors:
          (acc.unique_visitors || 0) + (stats.unique_visitors || 0),
        browser_stats: mergeCounts(acc.browser_stats, stats.browser_stats),
        device_stats: mergeCounts(acc.device_stats, stats.device_stats),
        country_stats: mergeCounts(acc.country_stats, stats.country_stats),
        utm_stats: mergeUtmStats(acc.utm_stats, stats.utm_stats),
        daily_clicks: mergeDailyCounts(acc.daily_clicks, stats.daily_clicks),
      }),
      {
        total_clicks: 0,
        unique_visitors: 0,
        browser_stats: {},
        device_stats: {},
        country_stats: {},
        utm_stats: {
          sources: {},
          mediums: {},
          campaigns: {},
          terms: {},
          contents: {},
        },
        daily_clicks: {},
      }
    )
  } catch (error) {
    console.error('Error getting bio page stats:', error)
    throw error
  }
}

// Helper functions for merging stats
function mergeCounts(a: any = {}, b: any = {}) {
  const merged = { ...a }
  Object.entries(b).forEach(([key, value]) => {
    merged[key] = (merged[key] || 0) + (value as number)
  })
  return merged
}

function mergeUtmStats(a: any = {}, b: any = {}) {
  return {
    sources: mergeCounts(a.sources, b.sources),
    mediums: mergeCounts(a.mediums, b.mediums),
    campaigns: mergeCounts(a.campaigns, b.campaigns),
    terms: mergeCounts(a.terms, b.terms),
    contents: mergeCounts(a.contents, b.contents),
  }
}

function mergeDailyCounts(a: any = {}, b: any = {}) {
  const merged = { ...a }
  Object.entries(b).forEach(([date, count]) => {
    merged[date] = (merged[date] || 0) + (count as number)
  })
  return merged
}
