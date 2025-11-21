import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertQueueService } from './alert-queue.service';
import { CreateAlertDto } from '../common/dto/create-alert.dto';
import { UpdateAlertDto } from '../common/dto/update-alert.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiTags('alerts')
@ApiBearerAuth('jwt')
@Controller('alerts')
export class AlertController {
  private readonly logger = new Logger(AlertController.name);

  constructor(
    private readonly alertService: AlertService,
    private readonly alertQueueService: AlertQueueService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new alert' })
  @ApiResponse({ status: 201, description: 'The alert has been created.' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAlert(@Body() createAlertDto: CreateAlertDto) {
    this.logger.log(`Creating alert: ${JSON.stringify(createAlertDto)}`);
    return this.alertService.createAlert(createAlertDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get alerts for a user' })
  async getUserAlerts(@Query('userId') userId: string) {
    this.logger.log(`Getting alerts for user: ${userId}`);
    return this.alertService.getUserAlerts(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an alert by id' })
  async getAlert(@Param('id') id: string) {
    this.logger.log(`Getting alert: ${id}`);
    return this.alertService.getAlert(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an alert' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateAlert(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    this.logger.log(`Updating alert ${id}: ${JSON.stringify(updateAlertDto)}`);
    return this.alertService.updateAlert(id, updateAlertDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert' })
  async deleteAlert(@Param('id') id: string) {
    this.logger.log(`Deleting alert: ${id}`);
    await this.alertService.deleteAlert(id);
    return { success: true, message: 'Alert deleted successfully' };
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Evaluate and return alert status' })
  async getAlertStatus(@Param('id') id: string) {
    this.logger.log(`Evaluating alert: ${id}`);
    return this.alertService.evaluateAlert(id);
  }

  @Post(':id/evaluate')
  @ApiOperation({ summary: 'Queue immediate evaluation of a specific alert' })
  async queueAlertEvaluation(@Param('id') id: string) {
    this.logger.log(`Queueing evaluation for alert: ${id}`);
    await this.alertQueueService.queueEvaluateAlert(id);
    return { success: true, message: 'Alert evaluation queued' };
  }

  @Get(':id/forecast-analysis')
  @ApiOperation({ summary: 'Analyze forecast for an alert' })
  async getForecastAnalysis(@Param('id') id: string) {
    this.logger.log(`Analyzing forecast for alert: ${id}`);
    return this.alertService.analyzeForecast(id);
  }

  @Post('process')
  @ApiOperation({ summary: 'Manually trigger alert processing for all active alerts' })
  async processAlerts() {
    this.logger.log('Manual alert processing triggered');
    await this.alertQueueService.queueProcessAllAlerts();
    return { success: true, message: 'Alert processing job queued' };
  }

  @Get('queue/stats')
  @ApiOperation({ summary: 'Get alert processing queue statistics' })
  async getQueueStats() {
    return this.alertQueueService.getQueueStats();
  }
}
