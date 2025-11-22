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
    <Card className="weather-card border-slate-800 bg-slate-900/50 backdrop-blur-xl h-full">
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center gap-2 text-slate-100 text-lg">
          <MapPin className="h-5 w-5 text-blue-400" />
          Search Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 px-[15%] sm:px-[20%] lg:px-[30%]">
        {/* City Search */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Search by City</label>
          <div className="flex gap-2">
            <Input
              placeholder="San Francisco, New York..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
              disabled={isLoading}
              className="h-9 text-sm flex-1 text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500 placeholder:text-slate-500"
            />
            <Button
              onClick={handleCitySearch}
              disabled={!city.trim() || isLoading}
              size="icon"
              className="h-9 w-9 bg-blue-600 hover:bg-blue-500 border-0 shadow-lg"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/50"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-800/50 px-3 py-1 rounded-full text-slate-400 font-semibold backdrop-blur-sm border border-slate-700/50">
              or
            </span>
          </div>
        </div>

        {/* Coordinates Search */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Search by Coordinates</label>
          <div className="flex gap-4">
            <Input
              placeholder="Latitude"
              type="number"
              step="any"
              value={coordinates.lat}
              onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
              disabled={isLoading}
              className="h-9 text-sm weather-data text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500 placeholder:text-slate-500 !px-3 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Input
              placeholder="Longitude"
              type="number"
              step="any"
              value={coordinates.lon}
              onChange={(e) => setCoordinates(prev => ({ ...prev, lon: e.target.value }))}
              disabled={isLoading}
              className="h-9 text-sm weather-data text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500 placeholder:text-slate-500 !px-3 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <Button
            onClick={handleCoordinateSearch}
            disabled={!coordinates.lat || !coordinates.lon || isLoading}
            variant="outline"
            className="w-full h-9 text-sm bg-slate-800/30 backdrop-blur-sm border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 font-semibold text-slate-200"
          >
            <Search className="h-3.5 w-3.5 mr-2" />
            Search Coordinates
          </Button>
        </div>

        {/* Current Location */}
        <Button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="w-full h-10 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white border-0 font-semibold shadow-lg"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Use My Location
        </Button>
      </CardContent>
    </Card>
  )
}
