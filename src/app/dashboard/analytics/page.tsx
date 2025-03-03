'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase/client'
import { dateToEpoch, epochToDate, getCurrentEpoch } from '@/lib/utils'
import { subDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Mock data for initial render
const INITIAL_DATA = {
  visitorStats: {
    total: 0,
    unique: 0,
    returning: 0
  },
  deviceStats: [],
  browserStats: [],
  countryStats: [],
  dailyVisits: []
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#6B66FF']

export default function AnalyticsPage() {
  const [data, setData] = useState(INITIAL_DATA)
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setIsLoading(true)

        // Calculate date range as epoch timestamps
        const endDate = getCurrentEpoch()
        let startDate = getCurrentEpoch()

        switch (timeRange) {
          case '24h':
            startDate = dateToEpoch(subDays(epochToDate(endDate), 1))
            break
          case '7d':
            startDate = dateToEpoch(subDays(epochToDate(endDate), 7))
            break
          case '30d':
            startDate = dateToEpoch(subDays(epochToDate(endDate), 30))
            break
          case '90d':
            startDate = dateToEpoch(subDays(epochToDate(endDate), 90))
            break
        }

        // Get visitor stats
        const { data: sessionData } = await supabase
          .from('visitor_sessions')
          .select('id, visitor_id, is_returning')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        // Get device stats
        const { data: deviceData } = await supabase
          .from('clicks')
          .select('device')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        // Get browser stats
        const { data: browserData } = await supabase
          .from('clicks')
          .select('browser')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        // Get country stats
        const { data: countryData } = await supabase
          .from('clicks')
          .select('country')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        // Get daily visits
        const { data: dailyData } = await supabase
          .from('clicks')
          .select('created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: true })

        // Process visitor stats
        const totalVisitors = sessionData?.length || 0
        const uniqueVisitors = new Set(sessionData?.map(s => s.visitor_id)).size
        const returningVisitors = sessionData?.filter(s => s.is_returning).length || 0

        // Process device stats
        const deviceCounts = {}
        deviceData?.forEach(item => {
          const device = item.device || 'Unknown'
          deviceCounts[device] = (deviceCounts[device] || 0) + 1
        })

        const deviceStats = Object.entries(deviceCounts).map(([name, value]) => ({
          name,
          value
        }))

        // Process browser stats
        const browserCounts = {}
        browserData?.forEach(item => {
          const browser = item.browser || 'Unknown'
          browserCounts[browser] = (browserCounts[browser] || 0) + 1
        })

        const browserStats = Object.entries(browserCounts).map(([name, value]) => ({
          name,
          value
        }))

        // Process country stats
        const countryCounts = {}
        countryData?.forEach(item => {
          const country = item.country || 'Unknown'
          countryCounts[country] = (countryCounts[country] || 0) + 1
        })

        const countryStats = Object.entries(countryCounts).map(([name, value]) => ({
          name,
          value
        }))

        // Process daily visits
        const dailyVisitCounts = {}
        dailyData?.forEach(item => {
          const date = new Date(item.created_at).toLocaleDateString()
          dailyVisitCounts[date] = (dailyVisitCounts[date] || 0) + 1
        })

        const dailyVisits = Object.entries(dailyVisitCounts).map(([date, count]) => ({
          date,
          visits: count
        }))

        // Update state with processed data
        setData({
          visitorStats: {
            total: totalVisitors,
            unique: uniqueVisitors,
            returning: returningVisitors
          },
          deviceStats,
          browserStats,
          countryStats,
          dailyVisits
        })
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [timeRange])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>

          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '24h'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '7d'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              7d
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '30d'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              30d
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '90d'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              90d
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Visitor Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Visitors</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{data.visitorStats.total}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Unique Visitors</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{data.visitorStats.unique}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Returning Visitors</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{data.visitorStats.returning}</p>
              </div>
            </div>

            {/* Daily Visits Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Visits</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.dailyVisits}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visits" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Device, Browser, and Country Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Device Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Devices</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.deviceStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.deviceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Browser Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Browsers</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.browserStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.browserStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Country Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Countries</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.countryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.countryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}