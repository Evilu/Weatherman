'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Location } from '@/lib/api'
import { MapPin, Search, Navigation } from 'lucide-react'

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void
  isLoading?: boolean
}

export default function LocationSearch({ onLocationSelect, isLoading }: LocationSearchProps) {
  const [city, setCity] = useState('')
  const [coordinates, setCoordinates] = useState({ lat: '', lon: '' })

  const handleCitySearch = () => {
    if (city.trim()) {
      onLocationSelect({ city: city.trim() })
      setCity('')
    }
  }

  const handleCoordinateSearch = () => {
    const lat = parseFloat(coordinates.lat)
    const lon = parseFloat(coordinates.lon)

    if (!isNaN(lat) && !isNaN(lon)) {
      onLocationSelect({ lat, lon })
      setCoordinates({ lat: '', lon: '' })
    }
  }

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSelect({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your current location. Please enter a city or coordinates.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  return (
    <Card className="weather-card border-0 min-h-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <MapPin className="h-6 w-6 text-sky-500" />
          Search Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* City Search */}
        <div className="space-y-3 stagger-fade-in">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Search by City</label>
          <div className="flex gap-2">
            <Input
              placeholder="San Francisco, New York..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
              disabled={isLoading}
              className="weather-input h-11 flex-1"
            />
            <Button
              onClick={handleCitySearch}
              disabled={!city.trim() || isLoading}
              size="icon"
              className="weather-button h-11 w-11"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative stagger-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white/30 px-4 py-1.5 rounded-full text-slate-600 font-bold backdrop-blur-sm border border-white/40">
              or
            </span>
          </div>
        </div>

        {/* Coordinates Search */}
        <div className="space-y-3 stagger-fade-in" style={{ animationDelay: '0.1s' }}>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Search by Coordinates</label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Latitude"
              type="number"
              step="any"
              value={coordinates.lat}
              onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
              disabled={isLoading}
              className="weather-input h-11 weather-data"
            />
            <Input
              placeholder="Longitude"
              type="number"
              step="any"
              value={coordinates.lon}
              onChange={(e) => setCoordinates(prev => ({ ...prev, lon: e.target.value }))}
              disabled={isLoading}
              className="weather-input h-11 weather-data"
            />
          </div>
          <Button
            onClick={handleCoordinateSearch}
            disabled={!coordinates.lat || !coordinates.lon || isLoading}
            variant="outline"
            className="w-full h-11 bg-white/40 backdrop-blur-sm border-white/50 hover:bg-white/60 font-semibold"
          >
            <Search className="h-4 w-4 mr-2" />
            Search Coordinates
          </Button>
        </div>

        {/* Current Location */}
        <Button
          onClick={getCurrentLocation}
          disabled={isLoading}
          variant="secondary"
          className="w-full h-12 bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/50 font-semibold stagger-fade-in"
          style={{ animationDelay: '0.15s' }}
        >
          <Navigation className="h-5 w-5 mr-2" />
          Use My Location
        </Button>
      </CardContent>
    </Card>
  )
}
