import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuditAction, EntityType } from '../constants/enums';
import { paginate } from '../common/pagination/paginate.util';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const categoryExists = await tx.category.findFirst({
        where: {
          OR: [
            { name: createCategoryDto.name },
            { slug: createCategoryDto.slug },
          ],
        },
      });

      if (categoryExists) {
        throw new ConflictException('Name or slug is already exists.');
      }

      const newCategory = await tx.category.create({
        data: {
          name: createCategoryDto.name,
          slug: createCategoryDto.slug,
          imageId: createCategoryDto.imageId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.CREATE,
          entity: EntityType.CATEGORY,
          entityId: newCategory.id,
          newData: JSON.stringify(newCategory),
        },
      });
      return {
        message: 'Successfully created category',
        data: newCategory.name,
      };
    });
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.prismaService.category, query, {
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        image: {
          select: {
            id: true,
            fileUrl: true,
            fileName: true,
          },
        },
        _count: {
          select: {
            products: true,
            subCategories: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        image: {
          select: {
            id: true,
            fileUrl: true,
            fileName: true,
          },
        },
      },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    userId?: string,
  ) {
    const categoryExists = await this.prismaService.category.findFirst({
      where: {
        OR: [
          { name: updateCategoryDto.name },
          { slug: updateCategoryDto.slug },
        ],
        NOT: { id },
      },
    });

    if (categoryExists) {
      throw new ConflictException('Name or slug is already exists.');
    }

    return this.prismaService.$transaction(async (tx) => {
      const oldCategory = await tx.category.findUnique({ where: { id } });

      if (!oldCategory)
        throw new NotFoundException(`Category with ID '${id}' not found`);

      const updatedCategory = await tx.category.update({
        where: { id },
        data: {
          name: updateCategoryDto.name,
          slug: updateCategoryDto.slug,
          imageId: updateCategoryDto.imageId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.UPDATE,
          entity: EntityType.CATEGORY,
          entityId: updatedCategory.id,
          oldData: JSON.stringify(oldCategory),
          newData: JSON.stringify(updatedCategory),
        },
      });

      return {
        message: `Successfully updated category to '${updatedCategory.name}'`,
        data: updatedCategory.name,
      };
    });
  }

  remove(id: number, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const oldCategory = await tx.category.findUnique({ where: { id } });
      if (!oldCategory)
        throw new NotFoundException(`Category with ID '${id}' not found`);

      await tx.category.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.DELETE,
          entity: EntityType.CATEGORY,
          entityId: oldCategory.id,
          oldData: JSON.stringify(oldCategory),
        },
      });

      return { message: `Successfully deleted category '${oldCategory.name}'` };
    });
  }
}
