'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Location, alertsApi } from '@/lib/api'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  Plus, 
  MapPin, 
  Thermometer, 
  Wind, 
  Droplets, 
  Cloud, 
  Eye,
  ArrowUp,
  ArrowDown,
  Equal
} from 'lucide-react'

interface CreateAlertFormProps {
  onSuccess?: () => void
}

const ALERT_PARAMETERS = [
  { value: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°C', color: 'text-orange-400', bgColor: 'bg-orange-950/30', borderColor: 'border-orange-500/40' },
  { value: 'windSpeed', label: 'Wind Speed', icon: Wind, unit: 'km/h', color: 'text-cyan-400', bgColor: 'bg-cyan-950/30', borderColor: 'border-cyan-500/40' },
  { value: 'humidity', label: 'Humidity', icon: Droplets, unit: '%', color: 'text-blue-400', bgColor: 'bg-blue-950/30', borderColor: 'border-blue-500/40' },
  { value: 'precipitationIntensity', label: 'Precipitation', icon: Cloud, unit: 'mm/h', color: 'text-indigo-400', bgColor: 'bg-indigo-950/30', borderColor: 'border-indigo-500/40' },
  { value: 'cloudCover', label: 'Cloud Cover', icon: Cloud, unit: '%', color: 'text-slate-400', bgColor: 'bg-slate-800/30', borderColor: 'border-slate-500/40' },
  { value: 'visibility', label: 'Visibility', icon: Eye, unit: 'km', color: 'text-purple-400', bgColor: 'bg-purple-950/30', borderColor: 'border-purple-500/40' },
]

const OPERATORS = [
  { value: 'gt', label: 'Greater than', icon: ArrowUp, symbol: '>', color: 'text-emerald-400', bgColor: 'bg-emerald-950/30', borderColor: 'border-emerald-500/40' },
  { value: 'gte', label: 'Greater or equal', icon: ArrowUp, symbol: '≥', color: 'text-emerald-400', bgColor: 'bg-emerald-950/30', borderColor: 'border-emerald-500/40' },
  { value: 'lt', label: 'Less than', icon: ArrowDown, symbol: '<', color: 'text-red-400', bgColor: 'bg-red-950/30', borderColor: 'border-red-500/40' },
  { value: 'lte', label: 'Less or equal', icon: ArrowDown, symbol: '≤', color: 'text-red-400', bgColor: 'bg-red-950/30', borderColor: 'border-red-500/40' },
  { value: 'eq', label: 'Equal to', icon: Equal, symbol: '=', color: 'text-blue-400', bgColor: 'bg-blue-950/30', borderColor: 'border-blue-500/40' },
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
  const selectedOperator = OPERATORS.find(o => o.value === formData.operator)

  return (
    <Card className="weather-card border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader className="border-b border-slate-800/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-100 text-xl">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30">
            <Plus className="h-5 w-5 text-blue-400" />
          </div>
          Create New Alert
        </CardTitle>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Set up custom weather conditions to monitor for your location
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Alert Name & Location - Combined Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Alert Name</label>
              <Input
                placeholder="High Temp Alert"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="h-9 text-sm text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                Location
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="City"
                  value={formData.location.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value, lat: '', lon: '' }
                  }))}
                  className="h-9 text-sm text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500"
                />
                <Input
                  placeholder="Lat"
                  type="number"
                  step="any"
                  value={formData.location.lat}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, lat: e.target.value, city: '' }
                  }))}
                  className="h-9 text-sm weather-data text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500"
                />
                <Input
                  placeholder="Lon"
                  type="number"
                  step="any"
                  value={formData.location.lon}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, lon: e.target.value, city: '' }
                  }))}
                  className="h-9 text-sm weather-data text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Weather Parameter - Compact Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Weather Parameter</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {ALERT_PARAMETERS.map((param) => {
                const Icon = param.icon
                const isSelected = formData.parameter === param.value
                return (
                  <button
                    key={param.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, parameter: param.value }))}
                    className={`p-2.5 rounded-lg border transition-all duration-200 transform ${
                      isSelected 
                        ? `${param.bgColor} ${param.borderColor} ring-2 ring-${param.color.replace('text-', '')}/60 scale-105 shadow-lg shadow-${param.color.replace('text-', '')}/20` 
                        : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 text-center">
                      <Icon className={`h-5 w-5 ${isSelected ? param.color : 'text-slate-400'} ${isSelected ? 'drop-shadow-glow' : ''}`} />
                      <p className={`text-[10px] font-semibold leading-tight ${isSelected ? 'text-slate-50' : 'text-slate-400'}`}>
                        {param.label}
                      </p>
                      <p className={`text-[9px] ${isSelected ? param.color : 'text-slate-500'}`}>
                        {param.unit}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Condition & Threshold - Combined Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Operator - Compact Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Condition</label>
              <div className="grid grid-cols-5 gap-2">
                {OPERATORS.map((op) => {
                  const Icon = op.icon
                  const isSelected = formData.operator === op.value
                  return (
                    <button
                      key={op.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, operator: op.value }))}
                      className={`p-2 rounded-lg border transition-all duration-200 transform ${
                        isSelected 
                          ? `${op.bgColor} ${op.borderColor} ring-2 ring-${op.color.replace('text-', '')}/60 scale-105 shadow-lg shadow-${op.color.replace('text-', '')}/20` 
                          : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5 text-center">
                        <div className="flex items-center gap-0.5">
                          <Icon className={`h-3.5 w-3.5 ${isSelected ? op.color : 'text-slate-400'} ${isSelected ? 'drop-shadow-glow' : ''}`} />
                          <span className={`text-lg font-bold ${isSelected ? op.color : 'text-slate-400'} ${isSelected ? 'drop-shadow-glow' : ''}`}>
                            {op.symbol}
                          </span>
                        </div>
                        <p className={`text-[9px] font-semibold leading-tight ${isSelected ? 'text-slate-50' : 'text-slate-500'}`}>
                          {op.label.split(' ')[0]}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Threshold */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Threshold {selectedParameter && (
                  <span className="text-blue-400">({selectedParameter.unit})</span>
                )}
              </label>
              <Input
                placeholder="e.g., 25"
                type="number"
                step="any"
                value={formData.threshold}
                onChange={(e) => setFormData(prev => ({ ...prev, threshold: e.target.value }))}
                required
                className="h-9 weather-data text-base text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Alert Preview - Compact */}
          {selectedParameter && selectedOperator && formData.threshold && (
            <div className={`flex items-center gap-2 p-2.5 rounded-lg ${selectedParameter.bgColor} border ${selectedParameter.borderColor}`}>
              {(() => {
                const ParamIcon = selectedParameter.icon
                return <ParamIcon className={`h-4 w-4 ${selectedParameter.color} flex-shrink-0`} />
              })()}
              <p className="text-xs text-slate-300 font-medium">
                Triggers when <span className="font-bold">{selectedParameter.label.toLowerCase()}</span>{' '}
                {
                  formData.operator === 'gt' ? 'exceeds' :
                  formData.operator === 'lt' ? 'drops below' :
                  formData.operator === 'gte' ? 'reaches or exceeds' :
                  formData.operator === 'lte' ? 'reaches or drops below' :
                  'equals'
                }{' '}
                <span className="font-bold text-slate-100">{formData.threshold} {selectedParameter.unit}</span>
              </p>
            </div>
          )}

          {/* Submit Button - Compact */}
          <Button
            type="submit"
            className="w-full h-10 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 border-0 transform hover:scale-[1.02] active:scale-95"
            disabled={createAlertMutation.isPending}
          >
            {createAlertMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </>
            )}
          </Button>

          {createAlertMutation.error && (
            <div className="bg-red-950/30 backdrop-blur-sm border border-red-900/50 rounded-lg p-3">
              <p className="text-xs text-red-300 font-semibold">
                Error: {createAlertMutation.error.message}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
