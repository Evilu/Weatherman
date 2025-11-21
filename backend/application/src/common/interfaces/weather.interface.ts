export interface Location {
  city?: string;
  lat?: number;
  lon?: number;
}

export interface WeatherData {
  temperature?: number;
  windSpeed?: number;
  humidity?: number;
  precipitationIntensity?: number;
  cloudCover?: number;
  visibility?: number;
  time?: string;
}

export interface ForecastData extends WeatherData {
  time: string;
}

export interface TomorrowIoWebhook {
  eventType: 'weather_update' | 'alert_trigger';
  location: Location;
  data: WeatherData;
  timestamp: string;
}

export interface AlertEvaluation {
  alertId: string;
  triggered: boolean;
  value: number;
  threshold: number;
  parameter: string;
  weatherData: WeatherData;
}

export interface ForecastAnalysis {
  time: string;
  willTrigger: boolean;
  value: number;
  parameter: string;
}

