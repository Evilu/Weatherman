'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import WeatherCard from '@/components/weather/weather-card'
import LocationSearch from '@/components/weather/location-search'
import CreateAlertForm from '@/components/alerts/create-alert-form'
import AlertsList from '@/components/alerts/alerts-list'
import { Location, weatherApi, WeatherData } from '@/lib/api'
import { useAuth } from '@/components/providers/auth-provider'
import { LogOut, Cloud, Bell, Search, Plus } from 'lucide-react'

type TabType = 'weather' | 'alerts' | 'create-alert'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('weather')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const { data: weatherData, isLoading: isLoadingWeather, error: weatherError } = useQuery({
    queryKey: ['weather', selectedLocation],
    queryFn: async (): Promise<WeatherData> => {
      if (!selectedLocation) throw new Error('No location selected')
      const response = await weatherApi.getCurrent(selectedLocation)
      return response.data
    },
    enabled: !!selectedLocation,
  })

  const formatLocationName = (location: Location): string => {
    if (location.city) return location.city
    if (location.lat && location.lon) {
      return `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`
    }
    return 'Unknown Location'
  }

  const tabs = [
    { id: 'weather' as const, label: 'Weather', icon: Search },
    { id: 'alerts' as const, label: 'My Alerts', icon: Bell },
    { id: 'create-alert' as const, label: 'Create Alert', icon: Plus },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="weather-header shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Cloud className="h-8 w-8 text-blue-600 weather-icon" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Weatherman</h1>
                <p className="text-sm text-gray-600">Weather Alert System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="weather-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`weather-tab py-4 px-2 font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'active text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <LocationSearch
                  onLocationSelect={setSelectedLocation}
                  isLoading={isLoadingWeather}
                />
              </div>
              <div className="lg:col-span-2">
                {selectedLocation ? (
                  <WeatherCard
                    weather={weatherData!}
                    location={formatLocationName(selectedLocation)}
                    isLoading={isLoadingWeather}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center weather-card p-12">
                    <div className="text-center text-gray-600">
                      <Search className="h-16 w-16 mx-auto mb-6 opacity-40 weather-icon" />
                      <h3 className="text-xl font-semibold mb-2 text-gray-700">Search for Weather</h3>
                      <p className="text-gray-600">Select a location to view current weather conditions</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {weatherError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  Error loading weather data: {weatherError.message}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && <AlertsList />}

        {activeTab === 'create-alert' && (
          <div className="max-w-2xl mx-auto">
            <CreateAlertForm
              onSuccess={() => setActiveTab('alerts')}
            />
          </div>
        )}
      </main>
    </div>
  )
}
