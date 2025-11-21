'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeatherData } from '@/lib/api'
import { formatTemperature, formatWindSpeed, formatHumidity } from '@/lib/utils'
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Gauge
} from 'lucide-react'

interface WeatherCardProps {
  weather: WeatherData
  location: string
  isLoading?: boolean
}

export default function WeatherCard({ weather, location, isLoading }: WeatherCardProps) {
  const getWeatherIcon = (temp: number, precipitation: number) => {
    if (precipitation > 0.5) return <CloudRain className="h-14 w-14 text-blue-500 weather-icon" />
    if (temp > 20) return <Sun className="h-14 w-14 text-amber-400 weather-icon" />
    return <Cloud className="h-14 w-14 text-slate-400 weather-icon" />
  }

  if (isLoading) {
    return (
      <Card className="w-full weather-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="h-7 w-40 bg-white/30 weather-loading rounded-lg" />
            <div className="h-14 w-14 bg-white/30 weather-loading rounded-2xl" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-12 w-32 bg-white/30 weather-loading rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-white/30 weather-loading rounded-md" />
                <div className="h-7 w-20 bg-white/30 weather-loading rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const weatherMetrics = [
    {
      icon: Wind,
      label: 'Wind Speed',
      value: formatWindSpeed(weather.windSpeed),
      color: 'text-sky-500',
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: formatHumidity(weather.humidity),
      color: 'text-blue-500',
    },
    {
      icon: CloudRain,
      label: 'Precipitation',
      value: `${weather.precipitationIntensity.toFixed(1)} mm/h`,
      color: 'text-indigo-500',
    },
    {
      icon: Cloud,
      label: 'Cloud Cover',
      value: `${Math.round(weather.cloudCover)}%`,
      color: 'text-slate-500',
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: `${weather.visibility.toFixed(1)} km`,
      color: 'text-purple-500',
    },
    {
      icon: Gauge,
      label: 'Updated',
      value: new Date(weather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: 'text-emerald-500',
    },
  ]

  return (
    <Card className="w-full weather-card border-0 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">{location}</h2>
            <p className="text-sm text-slate-600 font-medium mt-1">Current Conditions</p>
          </div>
          {getWeatherIcon(weather.temperature, weather.precipitationIntensity)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Temperature Display */}
        <div className="flex items-baseline gap-3 pb-6 border-b border-white/30">
          <Thermometer className="h-6 w-6 text-orange-500 weather-icon" />
          <span className="text-6xl font-bold tracking-tighter text-slate-800 weather-data">
            {formatTemperature(weather.temperature)}
          </span>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {weatherMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className="stagger-fade-in flex items-start gap-3 p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Icon className={`h-5 w-5 ${metric.color} flex-shrink-0 mt-0.5`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 truncate">
                    {metric.label}
                  </p>
                  <p className="font-bold text-slate-800 text-lg weather-data truncate">
                    {metric.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
