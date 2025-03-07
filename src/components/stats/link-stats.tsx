'use client'

import { dateToEpoch } from '@/lib/utils'
import { subDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface LinkStats {
  total_clicks: number
  unique_visitors: number
  browser_stats: Record<string, number>
  device_stats: Record<string, number>
  country_stats: Record<string, number>
  utm_stats: {
    sources: Record<string, number>
    mediums: Record<string, number>
    campaigns: Record<string, number>
    terms: Record<string, number>
    contents: Record<string, number>
  }
  daily_clicks: Record<string, number>
}

export function LinkStats({ link }) {
  const [timeRange, setTimeRange] = useState('7d')
  const [stats, setStats] = useState<LinkStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        setError(null)

        // Calculate date range
        const endDate = new Date()
        let startDate = new Date()
        switch (timeRange) {
          case '24h':
            startDate = subDays(endDate, 1)
            break
          case '7d':
            startDate = subDays(endDate, 7)
            break
          case '30d':
            startDate = subDays(endDate, 30)
            break
          case '90d':
            startDate = subDays(endDate, 90)
            break
        }

        const response = await fetch(
          `/api/stats/${link.id}?startDate=${dateToEpoch(startDate)}&endDate=${dateToEpoch(endDate)}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }

        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Failed to load statistics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [link.id, timeRange])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500">
        No statistics available
      </div>
    )
  }

  // Process data for charts
  const dailyData = Object.entries(stats.daily_clicks).map(([date, clicks]) => ({
    date,
    clicks,
  }))

  const browserData = Object.entries(stats.browser_stats).map(([name, value]) => ({
    name,
    value,
  }))

  const deviceData = Object.entries(stats.device_stats).map(([name, value]) => ({
    name,
    value,
  }))

  const countryData = Object.entries(stats.country_stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name,
      value,
    }))

  const utmData = {
    sources: Object.entries(stats.utm_stats.sources),
    mediums: Object.entries(stats.utm_stats.mediums),
    campaigns: Object.entries(stats.utm_stats.campaigns),
    terms: Object.entries(stats.utm_stats.terms),
    contents: Object.entries(stats.utm_stats.contents),
  }

  return (
    <div className="space-y-6">
      {/* Time range selector */}
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

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Clicks</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.total_clicks}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Unique Visitors</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.unique_visitors}
          </p>
        </div>
      </div>

      {/* Daily clicks chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Clicks</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clicks" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Browser and Device charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browsers</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={browserData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {browserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Devices</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Countries table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Countries</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {countryData.map((country) => (
            <div key={country.name} className="px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-900">{country.name}</span>
              <span className="text-sm font-medium text-gray-500">{country.value} clicks</span>
            </div>
          ))}
        </div>
      </div>

      {/* UTM Parameters */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">UTM Parameters</h2>
        </div>
        <div className="p-6 space-y-6">
          {Object.entries(utmData).map(([category, data]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-900 capitalize mb-2">
                {category.replace('_', ' ')}
              </h3>
              <div className="space-y-2">
                {data
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([name, value]) => (
                    <div key={name} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{name || 'None'}</span>
                      <span className="text-sm font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}