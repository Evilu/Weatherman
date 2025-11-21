import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Location, WeatherData, ForecastData } from '../common/interfaces/weather.interface';
import Redis from 'ioredis';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.tomorrow.io/v4';
  private readonly redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('TOMORROW_IO_API_KEY') || '';

    // Initialize Redis for caching
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl);

    this.logger.log('Weather Service initialized');
  }

  /**
   * Get current weather with caching (5-minute TTL)
   */
  async getCurrentWeather(location: Location): Promise<WeatherData> {
    const cacheKey = this.getCacheKey('current', location);

    // Try to get from cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return JSON.parse(cached);
    }

    // Fetch from Tomorrow.io API
    this.logger.log(`Fetching current weather for location: ${JSON.stringify(location)}`);

    const locationString = this.getLocationString(location);
    const fields = 'temperature,windSpeed,humidity,precipitationIntensity,cloudCover,visibility';

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/timelines`, {
          params: {
            location: locationString,
            fields,
            timesteps: 'current',
            apikey: this.apiKey,
          },
        })
      );

      const weatherData = this.transformCurrentWeather(response.data);

      // Cache for 5 minutes
      await this.redis.setex(cacheKey, 300, JSON.stringify(weatherData));

      return weatherData;
    } catch (error) {
      this.logger.error(`Failed to fetch current weather: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get 3-day forecast with caching (1-hour TTL)
   */
  async getForecast(location: Location, days: number = 3): Promise<ForecastData[]> {
    const cacheKey = this.getCacheKey('forecast', location);

    // Try to get from cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return JSON.parse(cached);
    }

    this.logger.log(`Fetching forecast for location: ${JSON.stringify(location)}`);

    const locationString = this.getLocationString(location);
    const fields = 'temperature,windSpeed,humidity,precipitationIntensity,cloudCover,visibility';

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/timelines`, {
          params: {
            location: locationString,
            fields,
            timesteps: '1h',
            endTime: `nowPlus${days}d`,
            apikey: this.apiKey,
          },
        })
      );

      const forecastData = this.transformForecast(response.data);

      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(forecastData));

      return forecastData;
    } catch (error) {
      this.logger.error(`Failed to fetch forecast: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch fetch weather data for multiple locations
   */
  async batchFetchWeather(locations: Location[]): Promise<Map<string, WeatherData>> {
    this.logger.log(`Batch fetching weather for ${locations.length} locations`);

    const results = new Map<string, WeatherData>();

    // Process in parallel with concurrency limit
    const promises = locations.map(async (location) => {
      try {
        const weather = await this.getCurrentWeather(location);
        const key = this.getLocationString(location);
        results.set(key, weather);
      } catch (error) {
        this.logger.error(`Failed to fetch weather for ${JSON.stringify(location)}: ${error.message}`);
      }
    });

    await Promise.all(promises);

    return results;
  }

  /**
   * Get cached weather data (for fallback scenarios)
   */
  async getCachedWeather(location: Location): Promise<WeatherData | null> {
    const cacheKey = this.getCacheKey('current', location);
    const cached = await this.redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Transform Tomorrow.io API response to our WeatherData format
   */
  private transformCurrentWeather(response: any): WeatherData {
    const intervals = response?.data?.timelines?.[0]?.intervals;
    if (!intervals || intervals.length === 0) {
      throw new Error('No weather data in response');
    }

    const values = intervals[0].values;
    return {
      temperature: values.temperature,
      windSpeed: values.windSpeed,
      humidity: values.humidity,
      precipitationIntensity: values.precipitationIntensity,
      cloudCover: values.cloudCover,
      visibility: values.visibility,
      time: intervals[0].startTime,
    };
  }

  /**
   * Transform forecast response
   */
  private transformForecast(response: any): ForecastData[] {
    const intervals = response?.data?.timelines?.[0]?.intervals;
    if (!intervals || intervals.length === 0) {
      throw new Error('No forecast data in response');
    }

    return intervals.map((interval: any) => ({
      temperature: interval.values.temperature,
      windSpeed: interval.values.windSpeed,
      humidity: interval.values.humidity,
      precipitationIntensity: interval.values.precipitationIntensity,
      cloudCover: interval.values.cloudCover,
      visibility: interval.values.visibility,
      time: interval.startTime,
    }));
  }

  /**
   * Convert Location object to string format for API
   */
  private getLocationString(location: Location): string {
    if (location.lat !== undefined && location.lon !== undefined) {
      return `${location.lat},${location.lon}`;
    }
    if (location.city) {
      return location.city;
    }
    throw new Error('Location must have either lat/lon or city');
  }

  /**
   * Generate cache key for location
   */
  private getCacheKey(type: 'current' | 'forecast', location: Location): string {
    const locationStr = this.getLocationString(location);
    return `weather:${type}:${locationStr}`;
  }

  /**
   * Clear cache for a specific location
   */
  async clearCache(location: Location): Promise<void> {
    const currentKey = this.getCacheKey('current', location);
    const forecastKey = this.getCacheKey('forecast', location);
    await this.redis.del(currentKey, forecastKey);
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    await this.redis.quit();
  }
}

