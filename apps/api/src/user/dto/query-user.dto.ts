import { IsIn, IsOptional } from 'class-validator';

import { Transform } from 'class-transformer';
import { UserRole } from '../../constants/enums';
import { PaginationQueryDto } from '../../common/pagination/dto/pagination-query.dto';

export class UserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : undefined,
  )
  active?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    return typeof value === 'string'
      ? UserRole[value.toUpperCase() as keyof typeof UserRole]
      : undefined;
  })
  @IsIn([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR], {
    message:
      'role must be one of the following values: SUPER_ADMIN, ADMIN, MODERATOR',
  })
  role?: UserRole;
}
