import { IsDateString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/dto/pagination-query.dto';
import { Transform } from 'class-transformer';

export class QueryPromoCodeDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : undefined,
  )
  active?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
