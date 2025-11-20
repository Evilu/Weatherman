import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto, AlertParameter, AlertOperator } from './create-alert.dto';

export class UpdateAlertDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsEnum(AlertParameter)
  parameter?: AlertParameter;

  @IsOptional()
  @IsEnum(AlertOperator)
  operator?: AlertOperator;

  @IsOptional()
  @IsNumber()
  threshold?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

