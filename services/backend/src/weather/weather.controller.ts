import { Controller, Get, Query, Logger } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Location } from '../common/interfaces/weather.interface';

@Controller('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  async getCurrentWeather(@Query() query: any) {
    this.logger.log(`Getting current weather for: ${JSON.stringify(query)}`);

    const location: Location = this.parseLocation(query);
    return this.weatherService.getCurrentWeather(location);
  }

  @Get('forecast')
  async getForecast(@Query() query: any) {
    this.logger.log(`Getting forecast for: ${JSON.stringify(query)}`);

    const location: Location = this.parseLocation(query);
    const days = parseInt(query.days) || 3;

    return this.weatherService.getForecast(location, days);
  }

  private parseLocation(query: any): Location {
    if (query.lat && query.lon) {
      return {
        lat: parseFloat(query.lat),
        lon: parseFloat(query.lon),
      };
    }
    if (query.city) {
      return { city: query.city };
    }
    throw new Error('Location must include either lat/lon or city');
  }
}

