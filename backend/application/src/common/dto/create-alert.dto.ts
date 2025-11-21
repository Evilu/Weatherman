import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'San Francisco' })
  city?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 37.7749 })
  lat?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: -122.4194 })
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
  @ApiProperty({ example: '00000000-0000-4000-8000-000000000001' })
  userId: string;

  @IsString()
  @ApiProperty({ example: 'High temperature alert' })
  name: string;

  @ValidateNested()
  @Type(() => LocationDto)
  @ApiProperty({ type: LocationDto })
  location: LocationDto;

  @IsEnum(AlertParameter)
  @ApiProperty({ enum: AlertParameter })
  parameter: AlertParameter;

  @IsEnum(AlertOperator)
  @ApiProperty({ enum: AlertOperator })
  operator: AlertOperator;

  @IsNumber()
  @ApiProperty({ example: 32.5 })
  threshold: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
