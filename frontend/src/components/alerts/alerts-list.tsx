'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, alertsApi } from '@/lib/api'
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
  XCircle
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

export default function AlertsList() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

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

  const formatLocation = (location: any) => {
    if (location.city) return location.city
    if (location.lat && location.lon) {
      return `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`
    }
    return 'Unknown location'
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

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-6 rounded-2xl border-2 transition-all duration-300',
                    getStatusColor(alert.status),
                    !alert.isActive && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(alert.status)}
                        <h3 className="font-semibold">{alert.name}</h3>
                        {!alert.isActive && (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
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

                    <div className="flex gap-2 ml-4">
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
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
