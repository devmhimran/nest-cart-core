import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  @IsIn(['webp', 'png', 'jpg', 'jpeg', 'svg', 'pdf', 'csv', 'xlsx'], {
    message:
      'File type must be one of: webp, png, jpg, jpeg, svg, pdf, csv, xlsx',
  })
  file_type!: string;

  @IsString()
  @IsOptional()
  file_name?: string;

  @IsString()
  @IsOptional()
  file_alt?: string;
}
