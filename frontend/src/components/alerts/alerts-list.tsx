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
      <div className="p-4 bg-white/10 rounded-lg mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-medium">Loading 3-Day Forecast...</span>
        </div>
      </div>
    )
  }

  if (!forecast || forecast.length === 0) {
    return (
      <div className="p-4 bg-white/10 rounded-lg mt-4">
        <p className="text-sm text-muted-foreground">No forecast data available</p>
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
    <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-semibold">3-Day Forecast Analysis</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ParameterIcon className="h-3 w-3" />
          <span className="text-muted-foreground">
            Condition: {parameter} {operatorSymbol} {threshold}{unit}
          </span>
        </div>
      </div>

      {triggeredPoints.length === 0 ? (
        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/40 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-700">Alert will NOT trigger</p>
            <p className="text-xs text-green-600">No forecast periods meet the alert condition</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-amber-500/20 border border-amber-500/40 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-700">
                Alert will trigger {triggeredPoints.length} time{triggeredPoints.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-600">
                in the next 3 days
              </p>
            </div>
          </div>

          {/* Day-by-day breakdown */}
          <div className="space-y-2">
            {Object.entries(forecastByDay).map(([date, points]: [string, ForecastPoint[]]) => {
              const dayTriggered = points.filter((p: ForecastPoint) => p.willTrigger)

              if (dayTriggered.length === 0) return null

              return (
                <div key={date} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{date}</span>
                    <span className="text-xs text-muted-foreground">
                      {dayTriggered.length} trigger{dayTriggered.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayTriggered.slice(0, 5).map((point: ForecastPoint, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {new Date(point.time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {point.value.toFixed(1)}{unit}
                          </span>
                          {point.value > threshold ? (
                            <TrendingUp className="h-3 w-3 text-red-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                    {dayTriggered.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center pt-1">
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
      <Card>
        <CardHeader>
          <CardTitle>Your Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg weather-loading bg-gray-200 backdrop-blur-md border-gray-300">
                <div className="h-4 bg-gray-400 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-400 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-400 rounded w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Your Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No alerts yet</p>
            <p>Create your first weather alert to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const ParameterIcon = PARAMETER_ICONS[alert.parameter] || Thermometer
              const unit = PARAMETER_UNITS[alert.parameter] || ''
              const operatorSymbol = OPERATOR_SYMBOLS[alert.operator] || alert.operator
              const isExpanded = expandedAlertId === alert.id

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-6 rounded-2xl border-2 transition-all duration-300',
                    getStatusColor(alert.status),
                    !alert.isActive && 'opacity-60',
                    'cursor-pointer hover:shadow-lg'
                  )}
                >
                  <div
                    className="flex items-start justify-between"
                    onClick={() => toggleExpanded(alert.id)}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(alert.status)}
                        <h3 className="font-semibold">{alert.name}</h3>
                        {!alert.isActive && (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {formatLocation(alert.location)}
                        </div>
                        <div className="flex items-center gap-1">
                          <ParameterIcon className="h-3 w-3" />
                          {alert.parameter} {operatorSymbol} {alert.threshold}{unit}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Status: {alert.status.replace('_', ' ')}</span>
                        {alert.lastChecked && (
                          <span>
                            Last checked: {new Date(alert.lastChecked).toLocaleString()}
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
