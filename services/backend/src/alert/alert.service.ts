import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { prisma } from '../common/prisma.client';
import { CreateAlertDto } from '../common/dto/create-alert.dto';
import { UpdateAlertDto } from '../common/dto/update-alert.dto';
import { WeatherService } from '../weather/weather.service';

import { WeatherData, AlertEvaluation, ForecastAnalysis } from '../common/interfaces/weather.interface';
import {alert} from "@prisma/client";

// Avoid importing generated Prisma model types here to prevent editor/TS server resolution issues
// Use a lightweight local type for Alert and an enum for statuses used in business logic.
export enum AlertStatus {
  NOT_TRIGGERED = 'NOT_TRIGGERED',
  TRIGGERED = 'TRIGGERED',
  ERROR = 'ERROR',
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    private readonly prisma: PrismaService, // keep service to control lifecycle
    private readonly weatherService: WeatherService,
  ) {
    // reference prismaService to avoid unused-field warnings while still using the shared client
    void this.prisma;
  }

  /**
   * Create a new alert
   */
  async createAlert(createAlertDto: CreateAlertDto): Promise<any> {
    this.logger.log(`Creating alert for user ${createAlertDto.userId}`);

    return prisma.alert.create({
      data: {
        userId: createAlertDto.userId,
        name: createAlertDto.name,
        location: createAlertDto.location as any,
        parameter: createAlertDto.parameter,
        operator: createAlertDto.operator,
        threshold: createAlertDto.threshold,
        isActive: createAlertDto.isActive ?? true,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Get all alerts for a user
   */
  async getUserAlerts(userId: string): Promise<any[]> {
    return prisma.alert.findMany({
      where: { userId },
      include: {
        history: {
          orderBy: { triggeredAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a specific alert by ID
   */
  async getAlert(alertId: string): Promise<any> {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        user: true,
        history: {
          orderBy: { triggeredAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${alertId} not found`);
    }

    return alert;
  }

  /**
   * Update an alert
   */
  async updateAlert(alertId: string, updateAlertDto: UpdateAlertDto): Promise<any> {
    this.logger.log(`Updating alert ${alertId}`);

    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundException(`Alert with ID ${alertId} not found`);
    }

    return prisma.alert.update({
      where: { id: alertId },
      data: {
        ...(updateAlertDto.name && { name: updateAlertDto.name }),
        ...(updateAlertDto.location && { location: updateAlertDto.location as any }),
        ...(updateAlertDto.parameter && { parameter: updateAlertDto.parameter }),
        ...(updateAlertDto.operator && { operator: updateAlertDto.operator }),
        ...(updateAlertDto.threshold !== undefined && { threshold: updateAlertDto.threshold }),
        ...(updateAlertDto.isActive !== undefined && { isActive: updateAlertDto.isActive }),
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Delete an alert
   */
  async deleteAlert(alertId: string): Promise<void> {
    this.logger.log(`Deleting alert ${alertId}`);

    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundException(`Alert with ID ${alertId} not found`);
    }

    await prisma.alert.delete({ where: { id: alertId } });
  }

  /**
   * Evaluate if an alert should trigger based on current weather
   */
  async evaluateAlert(alertId: string): Promise<AlertEvaluation> {
    const alert = await this.getAlert(alertId);

    if (!alert.isActive) {
      this.logger.debug(`Alert ${alertId} is not active, skipping evaluation`);
      return null;
    }

    const location = alert.location as any;
    const weatherData = await this.weatherService.getCurrentWeather(location);

    const value = weatherData[alert.parameter];
    const triggered = this.evaluateCondition(value, alert.operator, alert.threshold);

    // Update alert status if changed
    if (triggered && alert.status !== AlertStatus.TRIGGERED) {
      await this.updateAlertStatus(alertId, AlertStatus.TRIGGERED);
      await this.createAlertHistory(alertId, 'TRIGGERED', weatherData);
      this.logger.log(`Alert ${alertId} TRIGGERED: ${alert.parameter} ${alert.operator} ${alert.threshold}`);
    } else if (!triggered && alert.status === AlertStatus.TRIGGERED) {
      await this.updateAlertStatus(alertId, AlertStatus.NOT_TRIGGERED);
      await this.resolveAlertHistory(alertId);
      this.logger.log(`Alert ${alertId} resolved`);
    }

    return {
      alertId,
      triggered,
      value,
      threshold: alert.threshold,
      parameter: alert.parameter,
      weatherData,
    };
  }

  /**
   * Analyze forecast for an alert
   */
  async analyzeForecast(alertId: string): Promise<ForecastAnalysis[]> {
    const alert = await this.getAlert(alertId);
    const location = alert.location as any;

    const forecast = await this.weatherService.getForecast(location, 3);

    return forecast.map((point) => ({
      time: point.time,
      willTrigger: this.evaluateCondition(
        point[alert.parameter],
        alert.operator,
        alert.threshold
      ),
      value: point[alert.parameter],
      parameter: alert.parameter,
    }));
  }

  /**
   * Get all active alerts that need to be checked
   */
  async getActiveAlerts(): Promise<any[]> {
    return prisma.alert.findMany({
      where: { isActive: true },
      include: { user: true },
    });
  }

  /**
   * Evaluate condition based on operator
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      case 'eq':
        return value === threshold;
      default:
        this.logger.error(`Unknown operator: ${operator}`);
        return false;
    }
  }

  /**
   * Update alert status
   */
  private async updateAlertStatus(alertId: string, status: AlertStatus): Promise<void> {
    await prisma.alert.update({
      where: { id: alertId },
      data: {
        status,
        lastChecked: new Date(),
      },
    });
  }

  /**
   * Create alert history entry
   */
  private async createAlertHistory(alertId: string, status: string, weatherData: WeatherData): Promise<void> {
    await prisma.alertHistory.create({
      data: {
        alertId,
        status,
        weatherData: weatherData as any,
        triggeredAt: new Date(),
      },
    });
  }

  /**
   * Resolve alert history (mark resolved)
   */
  private async resolveAlertHistory(alertId: string): Promise<void> {
    const latestHistory = await prisma.alertHistory.findFirst({
      where: {
        alertId,
        status: 'TRIGGERED',
        resolvedAt: null,
      },
      orderBy: { triggeredAt: 'desc' },
    });

    if (latestHistory) {
      await prisma.alertHistory.update({
        where: { id: latestHistory.id },
        data: { resolvedAt: new Date() },
      });
    }
  }

  /**
   * Process alerts (called by queue worker)
   */
  async processAlerts(): Promise<void> {
    this.logger.log('Processing all active alerts...');

    const alerts = await this.getActiveAlerts();
    this.logger.log(`Found ${alerts.length} active alerts to process`);

    // Group alerts by location for batch processing
    const alertsByLocation = new Map<string, alert[]>();

    for (const alert of alerts) {
      const location = alert.location as any;
      const key = location.lat && location.lon
        ? `${location.lat},${location.lon}`
        : location.city;

      if (!alertsByLocation.has(key)) {
        alertsByLocation.set(key, []);
      }
      alertsByLocation.get(key).push(alert);
    }

    // Fetch weather data in batch
    const locations = Array.from(alertsByLocation.keys()).map(key => {
      const parts = key.split(',');
      if (parts.length === 2) {
        return { lat: parseFloat(parts[0]), lon: parseFloat(parts[1]) };
      }
      return { city: key };
    });

    const weatherDataMap = await this.weatherService.batchFetchWeather(locations);

    // Evaluate each alert
    for (const [locationKey, alertsForLocation] of alertsByLocation.entries()) {
      const weatherData = weatherDataMap.get(locationKey);

      if (!weatherData) {
        this.logger.warn(`No weather data for location ${locationKey}`);
        continue;
      }

      for (const alert of alertsForLocation) {
        try {
          const value = weatherData[alert.parameter];
          const triggered = this.evaluateCondition(value, alert.operator, alert.threshold);

          if (triggered && alert.status !== AlertStatus.TRIGGERED) {
            await this.updateAlertStatus(alert.id, AlertStatus.TRIGGERED);
            await this.createAlertHistory(alert.id, 'TRIGGERED', weatherData);
            this.logger.log(`Alert ${alert.id} TRIGGERED`);
          } else if (!triggered && alert.status === AlertStatus.TRIGGERED) {
            await this.updateAlertStatus(alert.id, AlertStatus.NOT_TRIGGERED);
            await this.resolveAlertHistory(alert.id);
            this.logger.log(`Alert ${alert.id} resolved`);
          }
        } catch (error) {
          this.logger.error(`Error processing alert ${alert.id}: ${error.message}`);
          await this.updateAlertStatus(alert.id, AlertStatus.ERROR);
        }
      }
    }

    this.logger.log('Finished processing alerts');
  }
}
