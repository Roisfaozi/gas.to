import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  change: number
  changeLabel: string
}

export function StatsCard({ title, value, change, changeLabel }: StatsCardProps) {
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium ml-1">
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="ml-2 text-sm text-gray-500">{changeLabel}</p>
      </div>
    </div>
  )
}