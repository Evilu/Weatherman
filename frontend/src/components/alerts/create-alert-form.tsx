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

  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Alert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alert Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Alert Name</label>
            <Input
              placeholder="e.g., High Temperature in San Francisco"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="City (e.g., San Francisco)"
                value={formData.location.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, city: e.target.value, lat: '', lon: '' }
                }))}
              />
              <div className="md:col-span-2 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  value={formData.location.lat}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, lat: e.target.value, city: '' }
                  }))}
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
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Provide either a city name OR coordinates (not both)
            </p>
          </div>

          {/* Parameter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Weather Parameter</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.parameter}
              onChange={(e) => setFormData(prev => ({ ...prev, parameter: e.target.value }))}
              required
            >
              <option value="">Select parameter...</option>
              {ALERT_PARAMETERS.map((param) => (
                <option key={param.value} value={param.value}>
                  {param.label}
                </option>
              ))}
            </select>
          </div>

          {/* Operator */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Condition</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Threshold Value {selectedParameter && `(${selectedParameter.unit})`}
            </label>
            <Input
              placeholder="e.g., 25"
              type="number"
              step="any"
              value={formData.threshold}
              onChange={(e) => setFormData(prev => ({ ...prev, threshold: e.target.value }))}
              required
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={createAlertMutation.isPending}
          >
            {createAlertMutation.isPending ? 'Creating...' : 'Create Alert'}
          </Button>

          {createAlertMutation.error && (
            <p className="text-sm text-destructive">
              Error: {createAlertMutation.error.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
