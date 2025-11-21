import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto, AlertParameter, AlertOperator } from './create-alert.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAlertDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Updated alert name' })
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  @ApiPropertyOptional({ type: LocationDto })
  location?: LocationDto;

  @IsOptional()
  @IsEnum(AlertParameter)
  @ApiPropertyOptional({ enum: AlertParameter })
  parameter?: AlertParameter;

  @IsOptional()
  @IsEnum(AlertOperator)
  @ApiPropertyOptional({ enum: AlertOperator })
  operator?: AlertOperator;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 20.5 })
  threshold?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
