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
  Gauge,
  CloudSnow
} from 'lucide-react'

interface WeatherCardProps {
  weather: WeatherData
  location: string
  isLoading?: boolean
}

export default function WeatherCard({ weather, location, isLoading }: WeatherCardProps) {
  const getWeatherIcon = (temp: number, precipitation: number) => {
    if (precipitation > 0.5) return <CloudRain className="h-14 w-14 text-blue-400 weather-icon" />
    if (temp > 20) return <Sun className="h-14 w-14 text-amber-400 weather-icon" />
    if (temp < 5) return <CloudSnow className="h-14 w-14 text-cyan-400 weather-icon" />
    return <Cloud className="h-14 w-14 text-slate-400 weather-icon" />
  }

  if (isLoading) {
    return (
      <Card className="w-full weather-card border-slate-800 bg-slate-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="h-7 w-40 bg-slate-800 weather-loading rounded-lg" />
            <div className="h-14 w-14 bg-slate-800 weather-loading rounded-2xl" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-16 w-32 bg-slate-800 weather-loading rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-slate-800 weather-loading rounded-md" />
                <div className="h-7 w-20 bg-slate-800 weather-loading rounded-lg" />
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
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/30',
      borderColor: 'border-cyan-900/50'
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: formatHumidity(weather.humidity),
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/30',
      borderColor: 'border-blue-900/50'
    },
    {
      icon: CloudRain,
      label: 'Precipitation',
      value: `${weather.precipitationIntensity.toFixed(1)} mm/h`,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-950/30',
      borderColor: 'border-indigo-900/50'
    },
    {
      icon: Cloud,
      label: 'Cloud Cover',
      value: `${Math.round(weather.cloudCover)}%`,
      color: 'text-slate-400',
      bgColor: 'bg-slate-800/30',
      borderColor: 'border-slate-700/50'
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: `${weather.visibility.toFixed(1)} km`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/30',
      borderColor: 'border-purple-900/50'
    },
    {
      icon: Gauge,
      label: 'Updated',
      value: new Date(weather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/30',
      borderColor: 'border-emerald-900/50'
    },
  ]

  return (
    <Card className="w-full weather-card border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">{location}</h2>
            <p className="text-sm text-slate-400 font-medium mt-1">Current Conditions</p>
          </div>
          {getWeatherIcon(weather.temperature, weather.precipitationIntensity)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Temperature Display */}
        <div className="flex items-baseline gap-3 pb-6 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <Thermometer className="h-8 w-8 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium mb-1">Temperature</p>
              <span className="text-6xl font-bold tracking-tighter text-slate-100 weather-data">
                {formatTemperature(weather.temperature)}
              </span>
            </div>
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {weatherMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className={`stagger-fade-in flex flex-col gap-3 p-4 rounded-xl ${metric.bgColor} backdrop-blur-sm border ${metric.borderColor} hover:bg-slate-800/40 transition-all duration-300 hover:scale-[1.02] overflow-hidden`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${metric.color} flex-shrink-0`} />
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">
                    {metric.label}
                  </p>
                </div>
                <p className="font-bold text-slate-100 text-xl weather-data truncate">
                  {metric.value}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
