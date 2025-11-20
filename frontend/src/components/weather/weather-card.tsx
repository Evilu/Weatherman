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
  Thermometer
} from 'lucide-react'

interface WeatherCardProps {
  weather: WeatherData
  location: string
  isLoading?: boolean
}

export default function WeatherCard({ weather, location, isLoading }: WeatherCardProps) {
  const getWeatherIcon = (temp: number, precipitation: number) => {
    if (precipitation > 0.5) return <CloudRain className="h-12 w-12 text-blue-500 weather-icon" />
    if (temp > 20) return <Sun className="h-12 w-12 text-yellow-500 weather-icon" />
    return <Cloud className="h-12 w-12 text-gray-500 weather-icon" />
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="h-6 w-32 bg-gray-300 weather-loading rounded" />
            <div className="h-12 w-12 bg-gray-300 weather-loading rounded-full" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 w-24 bg-gray-300 weather-loading rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-gray-300 weather-loading rounded" />
                <div className="h-6 w-16 bg-gray-300 weather-loading rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-semibold">{location}</span>
          {getWeatherIcon(weather.temperature, weather.precipitationIntensity)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-orange-500" />
          <span className="text-3xl font-bold">
            {formatTemperature(weather.temperature)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm text-muted-foreground">Wind Speed</p>
              <p className="font-semibold">{formatWindSpeed(weather.windSpeed)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="font-semibold">{formatHumidity(weather.humidity)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Precipitation</p>
              <p className="font-semibold">{weather.precipitationIntensity.toFixed(1)} mm/h</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-muted-foreground">Cloud Cover</p>
              <p className="font-semibold">{Math.round(weather.cloudCover)}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Visibility</p>
              <p className="font-semibold">{weather.visibility.toFixed(1)} km</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Updated</p>
            <p className="font-semibold text-sm">
              {new Date(weather.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
