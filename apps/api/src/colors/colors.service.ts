import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
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
export class ColorsService {
  constructor(private prismaService: PrismaService) {}

  create(createColorDto: CreateColorDto, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const colorExists = await tx.color.findUnique({
        where: { name: createColorDto.name },
      });

      if (colorExists) {
        throw new ConflictException(
          `Color '${createColorDto.name}' already exists.`,
        );
      }

      const newColor = await tx.color.create({
        data: {
          name: createColorDto.name,
          hex: createColorDto.hex,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.CREATE,
          entity: EntityType.COLOR,
          entityId: newColor.id,
          newData: JSON.stringify(newColor),
        },
      });
      return { message: 'Successfully created color', data: newColor };
    });
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.prismaService.color, query, {
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const color = await this.prismaService.color.findUnique({ where: { id } });
    if (!color) {
      throw new NotFoundException(`Requested color not found.`);
    }
    return color;
  }

  async update(id: number, updateColorDto: UpdateColorDto, userId?: string) {
    if (updateColorDto.name) {
      const nameExists = await this.prismaService.color.findFirst({
        where: { name: updateColorDto.name, NOT: { id } },
      });

      if (nameExists) {
        throw new ConflictException(
          `Color '${updateColorDto.name}' already exists.`,
        );
      }
    }

    return this.prismaService.$transaction(async (tx) => {
      const oldColor = await tx.color.findUnique({ where: { id } });

      if (!oldColor) throw new NotFoundException(`Requested color not found.`);

      const updateColor = await tx.color.update({
        where: { id },
        data: {
          name: updateColorDto.name,
          hex: updateColorDto.hex,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.UPDATE,
          entity: EntityType.COLOR,
          entityId: updateColor.id,
          oldData: JSON.stringify(oldColor),
          newData: JSON.stringify(updateColor),
        },
      });

      return {
        message: `Successfully updated color`,
        data: updateColor,
      };
    });
  }

  remove(id: number, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const oldColor = await tx.color.findUnique({ where: { id } });
      if (!oldColor) throw new NotFoundException(`Requested color not found.`);

      await tx.color.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.DELETE,
          entity: EntityType.COLOR,
          entityId: oldColor.id,
          oldData: JSON.stringify(oldColor),
        },
      });

      return { message: `Successfully deleted color` };
    });
  }
}
