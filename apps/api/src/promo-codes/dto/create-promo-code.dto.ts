import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'SUMMER25' })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Summer Sale 25% Off' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ example: 25 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-08-31T23:59:59.999Z' })
  @IsNotEmpty()
  @IsDateString()
  endDate!: string;
}
