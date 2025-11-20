import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}

