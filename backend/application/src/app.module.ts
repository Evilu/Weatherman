import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { WeatherModule } from './weather/weather.module';
import { AlertModule } from './alert/alert.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    WeatherModule,
    AlertModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
