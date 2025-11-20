import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lon?: number;
}

export enum AlertParameter {
  TEMPERATURE = 'temperature',
  WIND_SPEED = 'windSpeed',
  HUMIDITY = 'humidity',
  PRECIPITATION = 'precipitationIntensity',
  CLOUD_COVER = 'cloudCover',
  VISIBILITY = 'visibility',
}

export enum AlertOperator {
  GT = 'gt',    // greater than
  LT = 'lt',    // less than
  GTE = 'gte',  // greater than or equal
  LTE = 'lte',  // less than or equal
  EQ = 'eq',    // equal
}

export class CreateAlertDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsEnum(AlertParameter)
  parameter: AlertParameter;

  @IsEnum(AlertOperator)
  operator: AlertOperator;

  @IsNumber()
  threshold: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

