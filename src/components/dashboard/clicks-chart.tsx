'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface ClicksChartProps {
  data: Array<{
    date: string
    clicks: number
  }>
}

export function ClicksChart({ data }: ClicksChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const options = {
    chart: {
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      type: 'datetime',
      categories: data.map(item => item.date),
      labels: {
        format: 'dd MMM',
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => Math.round(value),
      },
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy',
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    colors: ['#4F46E5'],
  }

  const series = [
    {
      name: 'Clicks',
      data: data.map(item => item.clicks),
    },
  ]

  return (
    <Chart
      options={options}
      series={series}
      type="area"
      height="100%"
    />
  )
}