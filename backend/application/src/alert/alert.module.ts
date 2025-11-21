import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { WebhookController } from './webhook.controller';
import { PrismaService } from '../common/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [ConfigModule, WeatherModule],
  controllers: [AlertController, WebhookController],
  providers: [AlertService, PrismaService],
  exports: [AlertService],
})
export class AlertModule {}

