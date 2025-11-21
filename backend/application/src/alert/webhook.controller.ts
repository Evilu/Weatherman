import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlertService } from './alert.service';
import { verifyTomorrowSignature } from './tomorrow-signature.util';
import { TomorrowIoWebhook } from '../common/interfaces/weather.interface';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';

@ApiTags('webhooks')
@Controller('webhooks/tomorrow-io')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly alertService: AlertService,
    private readonly configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.get<string>('TOMORROW_IO_WEBHOOK_SECRET') || '';
  }

  @Post()
  @ApiOperation({ summary: 'Handle Tomorrow.io webhook events' })
  @ApiHeader({ name: 'x-tomorrow-signature', required: false, description: 'Signature header for verifying webhook' })
  async handleWebhook(
    @Body() payload: TomorrowIoWebhook,
    @Headers('x-tomorrow-signature') signature?: string,
  ) {
    this.logger.log(`Received webhook: ${JSON.stringify(payload)}`);

    // Verify webhook signature if configured
    if (this.webhookSecret) {
      const isValid = verifyTomorrowSignature(signature, this.webhookSecret, payload);
      if (!isValid) {
        this.logger.error('Invalid webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    // Validate payload
    if (!payload || !payload.eventType) {
      throw new BadRequestException('Invalid webhook payload');
    }

    try {
      // Process webhook based on event type
      switch (payload.eventType) {
        case 'weather_update':
          await this.handleWeatherUpdate(payload);
          break;
        case 'alert_trigger':
          await this.handleAlertTrigger(payload);
          break;
        default:
          this.logger.warn(`Unknown event type: ${payload.eventType}`);
      }

      return { ok: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle weather update webhook
   */
  private async handleWeatherUpdate(payload: TomorrowIoWebhook): Promise<void> {
    this.logger.log(`Processing weather update for location: ${JSON.stringify(payload.location)}`);

    // Get all active alerts for this location and evaluate them
    const alerts = await this.alertService.getActiveAlerts();

    // Filter alerts that match this location
    const matchingAlerts = alerts.filter((alert) => {
      const alertLocation = alert.location as any;
      const webhookLocation = payload.location;

      // Check if locations match (simplified comparison)
      if (alertLocation.lat && alertLocation.lon && webhookLocation.lat && webhookLocation.lon) {
        const latDiff = Math.abs(alertLocation.lat - webhookLocation.lat);
        const lonDiff = Math.abs(alertLocation.lon - webhookLocation.lon);
        return latDiff < 0.1 && lonDiff < 0.1; // Within ~10km
      }

      if (alertLocation.city && webhookLocation.city) {
        return alertLocation.city.toLowerCase() === webhookLocation.city.toLowerCase();
      }

      return false;
    });

    this.logger.log(`Found ${matchingAlerts.length} alerts matching this location`);

    // Evaluate each matching alert
    for (const alert of matchingAlerts) {
      try {
        await this.alertService.evaluateAlert(alert.id);
      } catch (error) {
        this.logger.error(`Failed to evaluate alert ${alert.id}: ${error.message}`);
      }
    }
  }

  /**
   * Handle alert trigger webhook
   */
  private async handleAlertTrigger(payload: TomorrowIoWebhook): Promise<void> {
    this.logger.log(`Processing alert trigger for location: ${JSON.stringify(payload.location)}`);

    // Similar to weather update, evaluate all matching alerts
    await this.handleWeatherUpdate(payload);
  }
}
