import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertService } from './alert.service';
import { AlertQueueService } from './alert-queue.service';
import { AlertSchedulerService } from './alert-scheduler.service';
import { AlertController } from './alert.controller';
import { WebhookController } from './webhook.controller';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../common/prisma.service';
import { NotificationService } from '../common/notification.service';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from '../weather/weather.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    WeatherModule,
    AuthModule, // Import AuthModule to get JwtService
    ScheduleModule.forRoot(),
  ],
  controllers: [AlertController, WebhookController, NotificationsController],
  providers: [
    AlertService,
    AlertQueueService,
    AlertSchedulerService,
    NotificationService,
    PrismaService,
  ],
  exports: [AlertService, AlertQueueService, NotificationService],
})
export class AlertModule {}

