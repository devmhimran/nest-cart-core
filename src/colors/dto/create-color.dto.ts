import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CreateColorDto {
  @ApiProperty({ example: 'Black' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '#000000' })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{3}){1,2}$/, {
    message: 'hex must be a valid hex color code (e.g. #000000)',
  })
  hex?: string;
}
