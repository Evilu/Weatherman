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
      <div className="p-4 bg-slate-800/30 rounded-xl mt-4 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 animate-pulse text-blue-400" />
          <span className="text-sm font-semibold text-slate-300">Loading 3-Day Forecast...</span>
        </div>
      </div>
    )
  }

  if (!forecast || forecast.length === 0) {
    return (
      <div className="p-4 bg-slate-800/30 rounded-xl mt-4 border border-slate-700/50 backdrop-blur-sm">
        <p className="text-sm text-slate-400 font-medium">No forecast data available</p>
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
    <div className="mt-4 p-4 bg-slate-800/30 rounded-xl backdrop-blur-sm border border-slate-700/50 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-slate-200">3-Day Forecast</span>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1 bg-slate-700/50 rounded-full">
          <ParameterIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-slate-300 font-semibold weather-data truncate">
            {parameter} {operatorSymbol} {threshold}{unit}
          </span>
        </div>
      </div>

      {triggeredPoints.length === 0 ? (
        <div className="flex items-center gap-3 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-lg backdrop-blur-sm">
          <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-300 text-sm">Will NOT trigger</p>
            <p className="text-xs text-emerald-400/80 font-medium">No forecast periods meet the condition</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg backdrop-blur-sm">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-300 text-sm">
                Will trigger {triggeredPoints.length} time{triggeredPoints.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-400/80 font-medium">
                in the next 3 days
              </p>
            </div>
          </div>

          {/* Day-by-day breakdown */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar w-full">
            {Object.entries(forecastByDay).map(([date, points]: [string, ForecastPoint[]]) => {
              const dayTriggered = points.filter((p: ForecastPoint) => p.willTrigger)

              if (dayTriggered.length === 0) return null

              return (
                <div key={date} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30 w-full overflow-hidden">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-xs font-semibold text-slate-300 truncate flex-1">{date}</span>
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 bg-slate-700/50 rounded-full flex-shrink-0">
                      {dayTriggered.length} trigger{dayTriggered.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-1.5 w-full overflow-hidden">
                    {dayTriggered.slice(0, 5).map((point: ForecastPoint, idx: number) => (
                      <div key={idx} className="grid grid-cols-2 gap-4 items-center text-xs p-2 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-400 font-medium text-left">
                          {new Date(point.time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="font-mono font-bold text-slate-200 weather-data text-xs">
                            {point.value.toFixed(1)}{unit}
                          </span>
                          {point.value > threshold ? (
                            <TrendingUp className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                    {dayTriggered.length > 5 && (
                      <p className="text-[10px] text-slate-500 font-medium text-center pt-1">
                        + {dayTriggered.length - 5} more...
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
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case 'NOT_TRIGGERED':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-slate-500" />
      default:
        return <XCircle className="h-4 w-4 text-slate-500" />
    }
  }

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'TRIGGERED':
        return 'alert-triggered'
      case 'NOT_TRIGGERED':
        return 'alert-normal'
      case 'ERROR':
        return 'bg-slate-800/30 border-slate-700/50 backdrop-blur-md'
      default:
        return 'bg-slate-800/30 border-slate-700/50 backdrop-blur-md'
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
      <Card className="weather-card border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader className="border-b border-slate-800/50 pb-4">
          <CardTitle className="text-slate-100 text-xl">Your Alerts</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl weather-loading bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                <div className="h-4 bg-slate-700 rounded-lg w-3/4 mb-2" />
                <div className="h-3 bg-slate-700 rounded-lg w-1/2 mb-2" />
                <div className="h-3 bg-slate-700 rounded-lg w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="weather-card border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader className="border-b border-slate-800/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-100 text-xl">
          <Bell className="h-5 w-5 text-blue-400" />
          Your Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Bell className="h-12 w-12 mx-auto text-slate-600" />
            </div>
            <p className="text-lg font-bold text-slate-200 mb-2">No alerts yet</p>
            <p className="text-sm text-slate-400 font-medium">Create your first weather alert to get started</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 custom-scrollbar">
            {alerts.map((alert, index) => {
              const ParameterIcon = PARAMETER_ICONS[alert.parameter] || Thermometer
              const unit = PARAMETER_UNITS[alert.parameter] || ''
              const operatorSymbol = OPERATOR_SYMBOLS[alert.operator] || alert.operator
              const isExpanded = expandedAlertId === alert.id

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 rounded-xl border transition-all duration-200 overflow-hidden w-full',
                    getStatusColor(alert.status),
                    !alert.isActive && 'opacity-60',
                    'cursor-pointer hover:bg-slate-800/40'
                  )}
                >
                  <div
                    className="flex items-start justify-between w-full overflow-hidden gap-3"
                    onClick={() => toggleExpanded(alert.id)}
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {getStatusIcon(alert.status)}
                        <h3 className="font-bold text-base text-slate-100 truncate flex-1">{alert.name}</h3>
                        {!alert.isActive && (
                          <BellOff className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-medium text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-xs">{formatLocation(alert.location)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ParameterIcon className="h-3.5 w-3.5" />
                          <span className="weather-data text-xs">
                            {alert.parameter} {operatorSymbol} {alert.threshold}{unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-700/50 rounded-full">
                          {alert.status.replace('_', ' ')}
                        </span>
                        {alert.lastChecked && (
                          <span className="truncate">
                            {new Date(alert.lastChecked).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          "h-8 w-8 border transition-all duration-200",
                          alert.isActive 
                            ? "bg-blue-950/30 border-blue-900/50 hover:bg-blue-900/40 text-blue-400 hover:text-blue-300" 
                            : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-300"
                        )}
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
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-red-950/30 border-red-900/50 hover:bg-red-900/40 text-red-400 hover:text-red-300 transition-all duration-200"
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
