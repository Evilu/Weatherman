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
    if (precipitation > 0.5) return <CloudRain className="h-10 w-10 text-blue-400" />
    if (temp > 20) return <Sun className="h-10 w-10 text-amber-400" />
    if (temp < 5) return <CloudSnow className="h-10 w-10 text-cyan-400" />
    return <Cloud className="h-10 w-10 text-slate-400" />
  }

  if (isLoading) {
    return (
      <Card className="w-full weather-card border-slate-800 bg-slate-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="h-6 w-32 bg-slate-800 weather-loading rounded-lg" />
            <div className="h-10 w-10 bg-slate-800 weather-loading rounded-2xl" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-[15%] sm:px-[20%] lg:px-[30%]">
          <div className="h-12 w-24 bg-slate-800 weather-loading rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-slate-800 weather-loading rounded-md" />
                <div className="h-5 w-16 bg-slate-800 weather-loading rounded-lg" />
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
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">{location}</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Current Conditions</p>
          </div>
          {getWeatherIcon(weather.temperature, weather.precipitationIntensity)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 px-[15%] sm:px-[20%] lg:px-[30%]">
        {/* Temperature Display */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800/50">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
            <Thermometer className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Temperature</p>
            <span className="text-4xl font-bold tracking-tighter text-slate-100 weather-data">
              {formatTemperature(weather.temperature)}
            </span>
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {weatherMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className={`flex flex-col gap-2 p-3 rounded-lg ${metric.bgColor} backdrop-blur-sm border ${metric.borderColor} hover:bg-slate-800/40 transition-all duration-300 hover:scale-[1.02] overflow-hidden`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${metric.color} flex-shrink-0`} />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate">
                    {metric.label}
                  </p>
                </div>
                <p className="font-bold text-slate-100 text-base weather-data truncate">
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
