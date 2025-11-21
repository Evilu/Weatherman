'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, alertsApi, Location } from '@/lib/api'
import { useAuth } from '@/components/providers/auth-provider'
import {
  Bell,
  BellOff,
  Trash2,
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Cloud,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PARAMETER_ICONS: Record<string, typeof Thermometer> = {
  temperature: Thermometer,
  windSpeed: Wind,
  humidity: Droplets,
  precipitationIntensity: Cloud,
  cloudCover: Cloud,
  visibility: Eye,
}

const PARAMETER_UNITS: Record<string, string> = {
  temperature: '°C',
  windSpeed: 'km/h',
  humidity: '%',
  precipitationIntensity: 'mm/h',
  cloudCover: '%',
  visibility: 'km',
}

const OPERATOR_SYMBOLS: Record<string, string> = {
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  eq: '=',
}

interface ForecastPoint {
  time: string
  willTrigger: boolean
  value: number
  parameter: string
}

function ForecastAnalysis({ alertId, parameter, threshold, operator }: {
  alertId: string
  parameter: string
  threshold: number
  operator: string
}) {
  const { data: forecast, isLoading } = useQuery({
    queryKey: ['forecast-analysis', alertId],
    queryFn: async () => {
      const response = await alertsApi.getForecastAnalysis(alertId)
      return response.data as ForecastPoint[]
    },
  })

  const unit = PARAMETER_UNITS[parameter] || ''
  const operatorSymbol = OPERATOR_SYMBOLS[operator] || operator

  if (isLoading) {
    return (
      <div className="p-5 bg-white/20 rounded-xl mt-4 border border-white/30 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 animate-pulse text-sky-500" />
          <span className="text-sm font-bold text-slate-700">Loading 3-Day Forecast...</span>
        </div>
      </div>
    )
  }

  if (!forecast || forecast.length === 0) {
    return (
      <div className="p-5 bg-white/20 rounded-xl mt-4 border border-white/30 backdrop-blur-sm">
        <p className="text-sm text-slate-600 font-medium">No forecast data available</p>
      </div>
    )
  }

  const triggeredPoints = forecast.filter((f: ForecastPoint) => f.willTrigger)
  const ParameterIcon = PARAMETER_ICONS[parameter] || Thermometer

  // Group by day
  const forecastByDay = forecast.reduce((acc: Record<string, ForecastPoint[]>, point: ForecastPoint) => {
    const date = new Date(point.time).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(point)
    return acc
  }, {} as Record<string, ForecastPoint[]>)

  return (
    <div className="mt-4 p-5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-sky-500" />
          <span className="text-sm font-bold text-slate-800">3-Day Forecast Analysis</span>
        </div>
        <div className="flex items-center gap-2 text-sm px-3 py-1.5 bg-white/30 rounded-lg">
          <ParameterIcon className="h-4 w-4 text-slate-600" />
          <span className="text-slate-700 font-semibold weather-data">
            {parameter} {operatorSymbol} {threshold}{unit}
          </span>
        </div>
      </div>

      {triggeredPoints.length === 0 ? (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-xl backdrop-blur-sm">
          <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-emerald-700">Alert will NOT trigger</p>
            <p className="text-xs text-emerald-600 font-medium">No forecast periods meet the alert condition</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-500/20 border-2 border-amber-500/40 rounded-xl backdrop-blur-sm">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-amber-700">
                Alert will trigger {triggeredPoints.length} time{triggeredPoints.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-600 font-medium">
                in the next 3 days
              </p>
            </div>
          </div>

          {/* Day-by-day breakdown */}
          <div className="space-y-3">
            {Object.entries(forecastByDay).map(([date, points]: [string, ForecastPoint[]]) => {
              const dayTriggered = points.filter((p: ForecastPoint) => p.willTrigger)

              if (dayTriggered.length === 0) return null

              return (
                <div key={date} className="bg-white/15 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-800">{date}</span>
                    <span className="text-xs font-semibold text-slate-600 px-2 py-1 bg-white/30 rounded-md">
                      {dayTriggered.length} trigger{dayTriggered.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayTriggered.slice(0, 5).map((point: ForecastPoint, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white/10 rounded-lg">
                        <span className="text-slate-600 font-semibold">
                          {new Date(point.time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 weather-data">
                            {point.value.toFixed(1)}{unit}
                          </span>
                          {point.value > threshold ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                    {dayTriggered.length > 5 && (
                      <p className="text-xs text-slate-600 font-medium text-center pt-1">
                        +{dayTriggered.length - 5} more...
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AlertsList() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null)

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: async () => {
      if (!user) return []
      const response = await alertsApi.getAll(user.id)
      return response.data
    },
    enabled: !!user,
  })

  const deleteAlertMutation = useMutation({
    mutationFn: (alertId: string) => alertsApi.delete(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const toggleAlertMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      alertsApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const alerts: Alert[] = alertsData || []

  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case 'TRIGGERED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'NOT_TRIGGERED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'TRIGGERED':
        return 'alert-triggered'
      case 'NOT_TRIGGERED':
        return 'alert-normal'
      case 'ERROR':
        return 'bg-gray-500/20 border-gray-400/40 backdrop-blur-md'
      default:
        return 'bg-gray-500/20 border-gray-400/40 backdrop-blur-md'
    }
  }

  const formatLocation = (location: Location) => {
    if (location.city) return location.city
    if (location.lat && location.lon) {
      return `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`
    }
    return 'Unknown location'
  }

  const toggleExpanded = (alertId: string) => {
    setExpandedAlertId(expandedAlertId === alertId ? null : alertId)
  }

  if (isLoading) {
    return (
      <Card className="weather-card border-0">
        <CardHeader>
          <CardTitle className="text-slate-800 text-2xl">Your Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 rounded-xl weather-loading bg-white/20 backdrop-blur-sm border border-white/30">
                <div className="h-5 bg-white/40 rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-white/40 rounded-lg w-1/2 mb-2" />
                <div className="h-3 bg-white/40 rounded-lg w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="weather-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-slate-800 text-2xl">
          <Bell className="h-6 w-6 text-sky-500" />
          Your Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto mb-6 text-slate-400 weather-icon" />
            <p className="text-xl font-bold text-slate-700 mb-2">No alerts yet</p>
            <p className="text-slate-600 font-medium">Create your first weather alert to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const ParameterIcon = PARAMETER_ICONS[alert.parameter] || Thermometer
              const unit = PARAMETER_UNITS[alert.parameter] || ''
              const operatorSymbol = OPERATOR_SYMBOLS[alert.operator] || alert.operator
              const isExpanded = expandedAlertId === alert.id

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-6 rounded-xl border-2 transition-all duration-300 stagger-fade-in',
                    getStatusColor(alert.status),
                    !alert.isActive && 'opacity-60',
                    'cursor-pointer hover:scale-[1.02]'
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className="flex items-start justify-between"
                    onClick={() => toggleExpanded(alert.id)}
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(alert.status)}
                        <h3 className="font-bold text-lg text-slate-800">{alert.name}</h3>
                        {!alert.isActive && (
                          <BellOff className="h-4 w-4 text-slate-500" />
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-500 ml-auto" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-500 ml-auto" />
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {formatLocation(alert.location)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ParameterIcon className="h-4 w-4" />
                          <span className="weather-data">
                            {alert.parameter} {operatorSymbol} {alert.threshold}{unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="px-2 py-1 bg-white/30 rounded-md">
                          {alert.status.replace('_', ' ')}
                        </span>
                        {alert.lastChecked && (
                          <span>
                            {new Date(alert.lastChecked).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex gap-2 ml-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/40 backdrop-blur-sm border-white/50 hover:bg-white/60"
                        onClick={() =>
                          toggleAlertMutation.mutate({
                            id: alert.id,
                            isActive: !alert.isActive,
                          })
                        }
                        disabled={toggleAlertMutation.isPending}
                      >
                        {alert.isActive ? (
                          <BellOff className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                        disabled={deleteAlertMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Forecast Analysis - shown when expanded */}
                  {isExpanded && (
                    <ForecastAnalysis
                      alertId={alert.id}
                      parameter={alert.parameter}
                      threshold={alert.threshold}
                      operator={alert.operator}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
