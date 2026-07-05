import { PaginatedResult } from './paginated-res.interface';
import { PaginationQueryDto } from './dto/pagination-query.dto';

export interface PrismaModel<T, A> {
  findMany(args?: A): Promise<T[]>;
  count(args?: { where?: any }): Promise<number>;
}

export async function paginate<
  T,
  A extends { where?: unknown; take?: number; skip?: number },
>(
  model: PrismaModel<T, A>,
  queryDto: PaginationQueryDto,
  args?: A,
): Promise<PaginatedResult<T>> {
  const page = Number(queryDto.page) || 1;
  const limit = Number(queryDto.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      ...args,
      take: limit,
      skip: skip,
    } as unknown as A),
    model.count({ where: args?.where }),
  ]);

  const lastPage = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage: page,
      perPage: limit,
      prev: page > 1 ? page - 1 : null,
      next: page < lastPage ? page + 1 : null,
    },
  };
}
