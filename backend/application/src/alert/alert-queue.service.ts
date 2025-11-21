import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, QueueEvents } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { AlertService } from './alert.service';

@Injectable()
export class AlertQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AlertQueueService.name);
  private alertQueue: Queue;
  private worker: Worker;
  private queueEvents: QueueEvents;

  constructor(
    private readonly configService: ConfigService,
    private readonly alertService: AlertService,
  ) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

    // Parse Redis URL
    const redisConfig = {
      host: 'localhost',
      port: 6379,
    };

    try {
      const url = new URL(redisUrl);
      redisConfig.host = url.hostname;
      redisConfig.port = parseInt(url.port, 10) || 6379;
    } catch (error) {
      this.logger.warn(`Failed to parse Redis URL, using defaults: ${error.message}`);
    }

    // Initialize Queue
    this.alertQueue = new Queue('alert-processing', {
      connection: redisConfig,
    });

    // Initialize Worker
    this.worker = new Worker(
      'alert-processing',
      async (job) => {
        this.logger.log(`Processing job ${job.id}: ${job.name}`);

        try {
          switch (job.name) {
            case 'process-all-alerts':
              await this.alertService.processAlerts();
              break;
            case 'evaluate-single-alert':
              const alertId = job.data.alertId;
              await this.alertService.evaluateAlert(alertId);
              break;
            default:
              this.logger.warn(`Unknown job type: ${job.name}`);
          }
        } catch (error) {
          this.logger.error(`Job ${job.id} failed: ${error.message}`);
          throw error;
        }
      },
      {
        connection: redisConfig,
        concurrency: 5,
      }
    );

    // Initialize Queue Events
    this.queueEvents = new QueueEvents('alert-processing', {
      connection: redisConfig,
    });

    // Event listeners
    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });

    this.logger.log('Alert queue service initialized');
  }

  /**
   * Add job to process all active alerts
   */
  async queueProcessAllAlerts(): Promise<void> {
    await this.alertQueue.add('process-all-alerts', {}, {
      removeOnComplete: 100,
      removeOnFail: 50,
    });
    this.logger.log('Queued job to process all alerts');
  }

  /**
   * Add job to evaluate a single alert
   */
  async queueEvaluateAlert(alertId: string): Promise<void> {
    await this.alertQueue.add('evaluate-single-alert', { alertId }, {
      removeOnComplete: 100,
      removeOnFail: 50,
    });
    this.logger.log(`Queued job to evaluate alert ${alertId}`);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const waiting = await this.alertQueue.getWaitingCount();
    const active = await this.alertQueue.getActiveCount();
    const completed = await this.alertQueue.getCompletedCount();
    const failed = await this.alertQueue.getFailedCount();

    return {
      waiting,
      active,
      completed,
      failed,
    };
  }

  /**
   * Clean up on module destroy
   */
  async onModuleDestroy() {
    await this.worker?.close();
    await this.alertQueue?.close();
    await this.queueEvents?.close();
  }
}

