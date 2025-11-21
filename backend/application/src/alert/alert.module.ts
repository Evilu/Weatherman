import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertService } from './alert.service';
import { AlertQueueService } from './alert-queue.service';
import { AlertSchedulerService } from './alert-scheduler.service';
import { AlertController } from './alert.controller';
import { WebhookController } from './webhook.controller';
import { PrismaService } from '../common/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [
    ConfigModule,
    WeatherModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AlertController, WebhookController],
  providers: [
    AlertService,
    AlertQueueService,
    AlertSchedulerService,
    PrismaService,
  ],
  exports: [AlertService, AlertQueueService],
})
export class AlertModule {}

