import { IsNotEmpty, IsEnum } from 'class-validator';

export enum SizeType {
  XS = 'xs',
  S = 's',
  M = 'm',
  L = 'l',
  XL = 'xl',
  XXL = 'xxl',
  XXXL = '3xl',
  XXXXL = '4xl',
}

export class CreateSizeDto {
  @IsNotEmpty()
  @IsEnum(SizeType, {
    message: `Size name must be one of the following values: ${Object.values(SizeType).join(', ')}`,
  })
  name!: SizeType;
}
