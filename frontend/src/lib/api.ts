import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3535/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Types for the API
export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Location {
  city?: string
  lat?: number
  lon?: number
}

export interface Alert {
  id: string
  userId: string
  name: string
  location: Location
  parameter: string
  operator: string
  threshold: number
  isActive: boolean
  lastChecked?: string
  status: 'NOT_TRIGGERED' | 'TRIGGERED' | 'ERROR'
  createdAt: string
  updatedAt: string
}

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  precipitationIntensity: number
  cloudCover: number
  visibility: number
  condition?: string
  timestamp: string
}

export interface ForecastDay {
  date: string
  weather: WeatherData
}

// API functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (email: string, name: string, password: string) =>
    api.post('/auth/register', { email, name, password }),
}

export const weatherApi = {
  getCurrent: (location: Location) =>
    api.get('/weather/current', { params: location }),

  getForecast: (location: Location, days: number = 3) =>
    api.get('/weather/forecast', { params: { ...location, days } }),
}

export const alertsApi = {
  create: (alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastChecked'>) =>
    api.post('/alerts', alert),

  getAll: (userId: string) =>
    api.get('/alerts', { params: { userId } }),

  getById: (id: string) =>
    api.get(`/alerts/${id}`),

  update: (id: string, data: Partial<Alert>) =>
    api.put(`/alerts/${id}`, data),

  delete: (id: string) =>
    api.delete(`/alerts/${id}`),

  getStatus: (id: string) =>
    api.get(`/alerts/${id}/status`),

  getForecastAnalysis: (id: string) =>
    api.get(`/alerts/${id}/forecast-analysis`),
}
