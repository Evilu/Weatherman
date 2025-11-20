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
import { CreateAlertDto } from '../common/dto/create-alert.dto';
import { UpdateAlertDto } from '../common/dto/update-alert.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('alerts')
export class AlertController {
  private readonly logger = new Logger(AlertController.name);

  constructor(private readonly alertService: AlertService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAlert(@Body() createAlertDto: CreateAlertDto) {
    this.logger.log(`Creating alert: ${JSON.stringify(createAlertDto)}`);
    return this.alertService.createAlert(createAlertDto);
  }

  @Get()
  async getUserAlerts(@Query('userId') userId: string) {
    this.logger.log(`Getting alerts for user: ${userId}`);
    return this.alertService.getUserAlerts(userId);
  }

  @Get(':id')
  async getAlert(@Param('id') id: string) {
    this.logger.log(`Getting alert: ${id}`);
    return this.alertService.getAlert(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateAlert(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    this.logger.log(`Updating alert ${id}: ${JSON.stringify(updateAlertDto)}`);
    return this.alertService.updateAlert(id, updateAlertDto);
  }

  @Delete(':id')
  async deleteAlert(@Param('id') id: string) {
    this.logger.log(`Deleting alert: ${id}`);
    await this.alertService.deleteAlert(id);
    return { success: true, message: 'Alert deleted successfully' };
  }

  @Get(':id/status')
  async getAlertStatus(@Param('id') id: string) {
    this.logger.log(`Evaluating alert: ${id}`);
    return this.alertService.evaluateAlert(id);
  }

  @Get(':id/forecast-analysis')
  async getForecastAnalysis(@Param('id') id: string) {
    this.logger.log(`Analyzing forecast for alert: ${id}`);
    return this.alertService.analyzeForecast(id);
  }
}
