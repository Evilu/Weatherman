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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Search Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* City Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search by City</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter city name (e.g., San Francisco)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCitySearch()}
              disabled={isLoading}
            />
            <Button
              onClick={handleCitySearch}
              disabled={!city.trim() || isLoading}
              size="icon"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Coordinates Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search by Coordinates</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Latitude"
              type="number"
              step="any"
              value={coordinates.lat}
              onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
              disabled={isLoading}
            />
            <Input
              placeholder="Longitude"
              type="number"
              step="any"
              value={coordinates.lon}
              onChange={(e) => setCoordinates(prev => ({ ...prev, lon: e.target.value }))}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleCoordinateSearch}
            disabled={!coordinates.lat || !coordinates.lon || isLoading}
            variant="outline"
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            Search by Coordinates
          </Button>
        </div>

        {/* Current Location */}
        <Button
          onClick={getCurrentLocation}
          disabled={isLoading}
          variant="secondary"
          className="w-full"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Use Current Location
        </Button>
      </CardContent>
    </Card>
  )
}
