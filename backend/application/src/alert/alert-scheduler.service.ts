import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertQueueService } from './alert-queue.service';

@Injectable()
export class AlertSchedulerService {
  private readonly logger = new Logger(AlertSchedulerService.name);

  constructor(private readonly alertQueueService: AlertQueueService) {}

  /**
   * Process all active alerts every 5 minutes
   * This ensures alerts are checked regularly for triggering conditions
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduleAlertProcessing() {
    this.logger.log('Scheduled alert processing triggered');
    await this.alertQueueService.queueProcessAllAlerts();
  }

  /**
   * Optional: More frequent checks during business hours
   * Uncomment to enable more frequent checking between 6 AM and 10 PM
   */
  // @Cron('*/2 6-22 * * *') // Every 2 minutes from 6 AM to 10 PM
  // async scheduleFrequentAlertProcessing() {
  //   this.logger.log('Frequent alert processing triggered');
  //   await this.alertQueueService.queueProcessAllAlerts();
  // }
}

