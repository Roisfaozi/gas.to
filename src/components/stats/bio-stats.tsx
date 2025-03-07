'use client'

import { epochToDate } from '@/lib/utils'
import { format, subDays } from 'date-fns'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']
interface Country {
  name: string;
  value: number;
}
export function BioStats({ bioPage }) {
  const [timeRange, setTimeRange] = useState('7d')

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

  // Filter clicks by date range
  const filteredClicks = bioPage.clicks.filter(click => {
    const clickDate = epochToDate(click.created_at)
    return clickDate >= startDate && clickDate <= endDate
  })

  // Process data for charts
  const clicksByDay = {}
  const browsers = {}
  const devices = {}
  const countries = {}
  const linkClicks = {}

  filteredClicks.forEach(click => {
    // Daily clicks
    const day = format(epochToDate(click.created_at), 'yyyy-MM-dd')
    clicksByDay[day] = (clicksByDay[day] || 0) + 1

    // Browser stats
    browsers[click.browser] = (browsers[click.browser] || 0) + 1

    // Device stats
    devices[click.device] = (devices[click.device] || 0) + 1

    // Country stats
    if (click.country) {
      countries[click.country] = (countries[click.country] || 0) + 1
    }
  })

  // Process bio link clicks
  bioPage.bio_links.forEach(link => {
    linkClicks[link.title] = link.clicks?.length || 0
  })

  const dailyData = Object.entries(clicksByDay).map(([date, clicks]) => ({
    date,
    clicks,
  }))

  const browserData = Object.entries(browsers).map(([name, value]) => ({
    name,
    value,
  }))

  const deviceData = Object.entries(devices).map(([name, value]) => ({
    name,
    value,
  }))

  const countryData = Object.entries(countries).map(([name, value]) => ({
    name,
    value,
  }))

  const linkData = Object.entries(linkClicks).map(([name, value]) => ({
    name,
    value,
  }))

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {filteredClicks.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Unique Visitors</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {new Set(filteredClicks.map(c => c.visitor_id)).size}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Link Clicks</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {Object.values(linkClicks).reduce((a: number, b: number) => a + b, 0) as number}
          </p>
        </div>
      </div>

      {/* Daily views chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Views</h2>
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

      {/* Link clicks chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Link Clicks</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={linkData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" />
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
          {countryData
            .sort((a: Country, b: Country) => b.value - a.value)
            .slice(0, 10)
            .map((country) => (
              <div key={country.name} className="px-6 py-4 flex justify-between items-center">
                <span className="text-sm text-gray-900">{country.name}</span>
                <span className="text-sm font-medium text-gray-500">{country.value as number} views</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}