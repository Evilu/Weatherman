'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Location, alertsApi } from '@/lib/api'
import { useAuth } from '@/components/providers/auth-provider'
import { Plus, MapPin, Thermometer, Wind, Droplets, Cloud, Eye } from 'lucide-react'

interface CreateAlertFormProps {
  onSuccess?: () => void
}

const ALERT_PARAMETERS = [
  { value: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°C' },
  { value: 'windSpeed', label: 'Wind Speed', icon: Wind, unit: 'km/h' },
  { value: 'humidity', label: 'Humidity', icon: Droplets, unit: '%' },
  { value: 'precipitationIntensity', label: 'Precipitation', icon: Cloud, unit: 'mm/h' },
  { value: 'cloudCover', label: 'Cloud Cover', icon: Cloud, unit: '%' },
  { value: 'visibility', label: 'Visibility', icon: Eye, unit: 'km' },
]

const OPERATORS = [
  { value: 'gt', label: 'Greater than (>)' },
  { value: 'gte', label: 'Greater than or equal (≥)' },
  { value: 'lt', label: 'Less than (<)' },
  { value: 'lte', label: 'Less than or equal (≤)' },
  { value: 'eq', label: 'Equal to (=)' },
]

export default function CreateAlertForm({ onSuccess }: CreateAlertFormProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: '',
    location: { city: '', lat: '', lon: '' },
    parameter: '',
    operator: '',
    threshold: '',
  })

  interface AlertFormData {
    name: string
    location: { city: string; lat: string; lon: string }
    parameter: string
    operator: string
    threshold: string
  }

  const createAlertMutation = useMutation({
    mutationFn: async (alertData: AlertFormData) => {
      if (!user) throw new Error('User not authenticated')

      // Prepare location object
      const location: Location = {}
      if (alertData.location.city) {
        location.city = alertData.location.city
      } else if (alertData.location.lat && alertData.location.lon) {
        location.lat = parseFloat(alertData.location.lat)
        location.lon = parseFloat(alertData.location.lon)
      } else {
        throw new Error('Please provide either a city name or coordinates')
      }

      return alertsApi.create({
        userId: user.id,
        name: alertData.name,
        location,
        parameter: alertData.parameter,
        operator: alertData.operator,
        threshold: parseFloat(alertData.threshold),
        isActive: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      setFormData({
        name: '',
        location: { city: '', lat: '', lon: '' },
        parameter: '',
        operator: '',
        threshold: '',
      })
      onSuccess?.()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createAlertMutation.mutate(formData)
  }

  const selectedParameter = ALERT_PARAMETERS.find(p => p.value === formData.parameter)

  return (
    <Card className="weather-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-slate-800 text-2xl">
          <Plus className="h-6 w-6 text-sky-500" />
          Create New Alert
        </CardTitle>
        <p className="text-sm text-slate-600 font-medium mt-2">
          Set up custom weather conditions to monitor for your location
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert Name */}
          <div className="space-y-3 stagger-fade-in">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Alert Name</label>
            <Input
              placeholder="e.g., High Temperature Alert"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="weather-input h-11"
            />
          </div>

          {/* Location */}
          <div className="space-y-3 stagger-fade-in" style={{ animationDelay: '0.05s' }}>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-500" />
              Location
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="City name"
                value={formData.location.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, city: e.target.value, lat: '', lon: '' }
                }))}
                className="weather-input h-11"
              />
              <div className="md:col-span-2 grid grid-cols-2 gap-3">
                <Input
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  value={formData.location.lat}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, lat: e.target.value, city: '' }
                  }))}
                  className="weather-input h-11 weather-data"
                />
                <Input
                  placeholder="Longitude"
                  type="number"
                  step="any"
                  value={formData.location.lon}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, lon: e.target.value, city: '' }
                  }))}
                  className="weather-input h-11 weather-data"
                />
              </div>
            </div>
            <p className="text-xs text-slate-600 font-medium px-1">
              💡 Provide either a city name OR coordinates
            </p>
          </div>

          {/* Parameter */}
          <div className="space-y-3 stagger-fade-in" style={{ animationDelay: '0.1s' }}>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Weather Parameter</label>
            <select
              className="weather-input flex h-11 w-full rounded-full px-5 text-sm font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              value={formData.parameter}
              onChange={(e) => setFormData(prev => ({ ...prev, parameter: e.target.value }))}
              required
            >
              <option value="">Select parameter...</option>
              {ALERT_PARAMETERS.map((param) => (
                <option key={param.value} value={param.value}>
                  {param.label} ({param.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Operator */}
          <div className="space-y-3 stagger-fade-in" style={{ animationDelay: '0.15s' }}>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Condition</label>
            <select
              className="weather-input flex h-11 w-full rounded-full px-5 text-sm font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              value={formData.operator}
              onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
              required
            >
              <option value="">Select condition...</option>
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {/* Threshold */}
          <div className="space-y-3 stagger-fade-in" style={{ animationDelay: '0.2s' }}>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Threshold Value {selectedParameter && (
                <span className="text-sky-600">({selectedParameter.unit})</span>
              )}
            </label>
            <Input
              placeholder="e.g., 25"
              type="number"
              step="any"
              value={formData.threshold}
              onChange={(e) => setFormData(prev => ({ ...prev, threshold: e.target.value }))}
              required
              className="weather-input h-11 weather-data text-lg"
            />
            {selectedParameter && (
              <div className="flex items-center gap-2 px-1">
                {(() => {
                  const Icon = selectedParameter.icon
                  return <Icon className="h-4 w-4 text-sky-500" />
                })()}
                <p className="text-xs text-slate-600 font-medium">
                  Alert will trigger when {selectedParameter.label.toLowerCase()} {
                    formData.operator === 'gt' ? 'exceeds' :
                    formData.operator === 'lt' ? 'drops below' :
                    formData.operator === 'gte' ? 'reaches or exceeds' :
                    formData.operator === 'lte' ? 'reaches or drops below' :
                    'equals'
                  } {formData.threshold || '___'} {selectedParameter.unit}
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 weather-button text-base stagger-fade-in"
            disabled={createAlertMutation.isPending}
            style={{ animationDelay: '0.25s' }}
          >
            {createAlertMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Alert...
              </span>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Create Alert
              </>
            )}
          </Button>

          {createAlertMutation.error && (
            <div className="bg-red-50/80 backdrop-blur-sm border-2 border-red-300 rounded-xl p-4 animate-stagger-fade-in">
              <p className="text-sm text-red-700 font-semibold">
                Error: {createAlertMutation.error.message}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
