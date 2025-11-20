import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin User' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'strongPassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
