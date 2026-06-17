import { PrismaService } from '../prisma.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { AuditAction, EntityType } from '../constants/enums';
import { paginate } from '../common/pagination/paginate.util';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class SubCategoryService {
  constructor(private prismaService: PrismaService) {}

  async create(createSubCategoryDto: CreateSubCategoryDto, userId?: string) {
    return this.prismaService.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const subCategoryExists = await tx.subCategory.findFirst({
          where: {
            OR: [
              { name: createSubCategoryDto.name },
              { slug: createSubCategoryDto.slug },
            ],
          },
        });

        if (subCategoryExists) {
          throw new ConflictException('Name or slug is already exists.');
        }

        const newSubCategory = await tx.subCategory.create({
          data: {
            name: createSubCategoryDto.name,
            slug: createSubCategoryDto.slug,
            categoryId: createSubCategoryDto.categoryId,
          },
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: AuditAction.CREATE,
            entity: EntityType.SUB_CATEGORY,
            entityId: newSubCategory.id,
            newData: JSON.stringify(newSubCategory),
          },
        });
        return {
          message: 'Successfully created sub-category',
          data: newSubCategory.name,
        };
      },
    );
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.prismaService.subCategory, query, {
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const subCategory = await this.prismaService.subCategory.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!subCategory) {
      throw new NotFoundException(`Sub-category with ID '${id}' not found`);
    }
    return subCategory;
  }

  async update(
    id: number,
    updateSubCategoryDto: UpdateSubCategoryDto,
    userId?: string,
  ) {
    const subCategoryExists = await this.prismaService.subCategory.findFirst({
      where: {
        OR: [
          { name: updateSubCategoryDto.name },
          { slug: updateSubCategoryDto.slug },
        ],
        NOT: { id },
      },
    });

    if (subCategoryExists) {
      throw new ConflictException('Name or slug is already exists.');
    }

    return this.prismaService.$transaction(async (tx) => {
      const oldSubCategory = await tx.subCategory.findUnique({ where: { id } });

      if (!oldSubCategory)
        throw new NotFoundException(`Sub-category with ID '${id}' not found`);

      const updatedSubCategory = await tx.subCategory.update({
        where: { id },
        data: {
          name: updateSubCategoryDto.name,
          slug: updateSubCategoryDto.slug,
          categoryId: updateSubCategoryDto.categoryId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.UPDATE,
          entity: EntityType.SUB_CATEGORY,
          entityId: updatedSubCategory.id,
          oldData: JSON.stringify(oldSubCategory),
          newData: JSON.stringify(updatedSubCategory),
        },
      });

      return {
        message: `Successfully updated sub-category to '${updatedSubCategory.name}'`,
        data: updatedSubCategory.name,
      };
    });
  }

  remove(id: number, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const oldSubCategory = await tx.subCategory.findUnique({ where: { id } });
      if (!oldSubCategory)
        throw new NotFoundException(`Sub-category with ID '${id}' not found`);

      await tx.subCategory.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.DELETE,
          entity: EntityType.SUB_CATEGORY,
          entityId: oldSubCategory.id,
          oldData: JSON.stringify(oldSubCategory),
        },
      });

      return {
        message: `Successfully deleted sub-category '${oldSubCategory.name}'`,
      };
    });
  }
}
