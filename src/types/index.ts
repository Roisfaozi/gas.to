export interface AnalyticsData {
  totalClicks: number
  uniqueClicks: number
  growth: number
  topCountries: Array<{
    country: string
    count: number
  }>
  topDevices: Array<{
    device: string
    count: number
  }>
  topBrowsers: Array<{
    browser: string
    count: number
  }>
  topOS: Array<{
    os: string
    count: number
  }>
  clicksByDate: Array<{
    date: string
    clicks: number
  }>
}

export interface LinkStats {
  totalLinks: number
  activeLinks: number
  growth: number
}