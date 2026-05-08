// Removed unused AuditAction, EntityType imports
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { PrismaService } from '../prisma.service';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';
import { paginate } from '../common/pagination/paginate.util';

@Injectable()
export class SizeService {
  constructor(private prismaService: PrismaService) {}

  create(createSizeDto: CreateSizeDto, userId?: number) {
    return this.prismaService.$transaction(async (tx) => {
      const newSize = await tx.size.create({
        data: {
          name: createSizeDto.name,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          entity: 'SIZE',
          entityId: newSize.id,
          newData: JSON.stringify(newSize),
        },
      });
      return { message: 'Successfully created size', data: newSize.name };
    });
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.prismaService.size, query, {
      orderBy: { id: 'desc' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} size`;
  }

  update(id: number, updateSizeDto: UpdateSizeDto, userId?: number) {
    return this.prismaService.$transaction(async (tx) => {
      const oldSize = await tx.size.findUnique({ where: { id } });
      if (!oldSize) throw new NotFoundException(`Size with id ${id} not found`);

      const updateSize = await tx.size.update({
        where: { id },
        data: {
          name: updateSizeDto.name,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'SIZE',
          entityId: id,
          oldData: JSON.stringify(oldSize),
          newData: JSON.stringify(updateSize),
        },
      });

      return {
        message: `Successfully updated size with id ${id}`,
        data: updateSize.name,
      };
    });
  }

  remove(id: number, userId?: number) {
    return this.prismaService.$transaction(async (tx) => {
      const oldSize = await tx.size.findUnique({ where: { id } });
      if (!oldSize) throw new NotFoundException(`Size with id ${id} not found`);

      await tx.size.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'DELETE',
          entity: 'SIZE',
          entityId: id,
          oldData: JSON.stringify(oldSize),
        },
      });

      return { message: `Successfully deleted size with id ${id}` };
    });
  }
}
