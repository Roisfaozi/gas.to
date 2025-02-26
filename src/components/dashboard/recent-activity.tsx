'use client'

import { format } from 'date-fns'
import { Chrome, Facebook, Globe, Monitor } from 'lucide-react'

export interface ClickActivity {
  id: string
  type: 'bio' | 'shortlink'
  title: string
  url: string
  visited_at: string
  city: string
  country: string
  os: string
  browser: string
  referer: string | null
  language: string
}

interface RecentActivityProps {
  activities: ClickActivity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${activity.type === 'bio' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                    {activity.type === 'bio' ? 'B' : 'S'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                  <a
                    href={activity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-900"
                  >
                    {`${process.env.NEXT_PUBLIC_APP_URL}${activity.url}`}
                  </a>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {format(new Date(activity.visited_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {activity.city}, {activity.country}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{activity.os}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Chrome className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{activity.browser}</span>
              </div>
              {activity.referer && (
                <div className="flex items-center space-x-2">
                  <Facebook className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{activity.referer}</span>
                </div>
              )}
            </div>

            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Language: {activity.language}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}