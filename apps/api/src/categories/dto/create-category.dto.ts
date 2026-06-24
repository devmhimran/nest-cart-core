import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  slug!: string;

  @IsOptional()
  @IsNumber()
  imageId?: number;
}
