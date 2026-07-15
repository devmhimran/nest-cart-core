import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, EntityType } from '../constants/enums';
import { paginate } from '../common/pagination/paginate.util';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Injectable()
export class SizesService {
  constructor(private prismaService: PrismaService) {}

  create(createSizeDto: CreateSizeDto, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const sizeExists = await tx.size.findUnique({
        where: { name: createSizeDto.name },
      });

      if (sizeExists) {
        throw new ConflictException(
          `Size '${createSizeDto.name}' already exists.`,
        );
      }

      const newSize = await tx.size.create({
        data: {
          name: createSizeDto.name,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.CREATE,
          entity: EntityType.SIZE,
          entityId: newSize.id.toString(),
          newData: JSON.stringify(newSize),
        },
      });
      return { message: 'Successfully created size', data: newSize.name };
    });
  }

  findAll(query: PaginationQueryDto) {
    const { search } = query;
    const where: Prisma.SizeWhereInput = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};
    return paginate(this.prismaService.size, query, {
      where,
      orderBy: { id: 'desc' },
    });
  }

  async findOne(name: string) {
    const size = await this.prismaService.size.findUnique({ where: { name } });
    if (!size) {
      throw new NotFoundException(`Size with name '${name}' not found`);
    }
    return size;
  }

  async update(name: string, updateSizeDto: UpdateSizeDto, userId?: string) {
    const nameExists = await this.prismaService.size.findUnique({
      where: { name: updateSizeDto.name },
    });

    if (nameExists) {
      throw new ConflictException(
        `Size '${updateSizeDto.name}' already exists.`,
      );
    }

    return this.prismaService.$transaction(async (tx) => {
      const oldSize = await tx.size.findUnique({ where: { name } });

      if (!oldSize)
        throw new NotFoundException(`Size with name '${name}' not found`);

      const updateSize = await tx.size.update({
        where: { name },
        data: {
          name: updateSizeDto.name,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.UPDATE,
          entity: EntityType.SIZE,
          entityId: updateSize.id.toString(),
          oldData: JSON.stringify(oldSize),
          newData: JSON.stringify(updateSize),
        },
      });

      return {
        message: `Successfully updated size with name '${name}'`,
        data: updateSize.name,
      };
    });
  }

  remove(name: string, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const oldSize = await tx.size.findUnique({ where: { name } });
      if (!oldSize)
        throw new NotFoundException(`Size with name '${name}' not found`);

      await tx.size.delete({ where: { name } });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.DELETE,
          entity: EntityType.SIZE,
          entityId: oldSize.id.toString(),
          oldData: JSON.stringify(oldSize),
        },
      });

      return { message: `Successfully deleted size with name '${name}'` };
    });
  }
}
