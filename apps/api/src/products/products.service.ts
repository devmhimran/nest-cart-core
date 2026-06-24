import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditAction, EntityType } from '../constants/enums';
import { paginate } from '../common/pagination/paginate.util';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const exists = await tx.product.findFirst({
        where: {
          OR: [
            { title: createProductDto.title },
            { slug: createProductDto.slug },
          ],
        },
      });

      if (exists) {
        throw new ConflictException('Title or slug already exists.');
      }

      const { galleryMediaIds, variants, ...scalarData } = createProductDto;

      const newProduct = await tx.product.create({
        data: {
          title: scalarData.title,
          slug: scalarData.slug,
          description: scalarData.description,
          shortDescription: scalarData.shortDescription,
          additionalDescription: scalarData.additionalDescription,
          metaTitle: scalarData.metaTitle,
          metaDescription: scalarData.metaDescription,
          metaKeywords: scalarData.metaKeywords,
          basePrice: scalarData.basePrice,
          discountPrice: scalarData.discountPrice,
          isNew: scalarData.isNew,
          isActive: scalarData.isActive,
          mainImage: scalarData.mainImageId
            ? { connect: { id: scalarData.mainImageId } }
            : undefined,
          secondaryImage: scalarData.secondaryImageId
            ? { connect: { id: scalarData.secondaryImageId } }
            : undefined,
          category: scalarData.categoryId
            ? { connect: { id: scalarData.categoryId } }
            : undefined,
          subCategory: scalarData.subCategoryId
            ? { connect: { id: scalarData.subCategoryId } }
            : undefined,
          createdBy: userId ? { connect: { id: userId } } : undefined,
          gallery: galleryMediaIds?.length
            ? {
                create: galleryMediaIds.map((mediaId) => ({ mediaId })),
              }
            : undefined,
          variants: variants?.length
            ? {
                create: variants.map((v) => ({
                  price: v.price,
                  stock: v.stock ?? 0,
                  color: v.colorId ? { connect: { id: v.colorId } } : undefined,
                  size: v.sizeId ? { connect: { id: v.sizeId } } : undefined,
                })),
              }
            : undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.CREATE,
          entity: EntityType.PRODUCT,
          entityId: newProduct.id,
          newData: JSON.stringify(newProduct),
        },
      });

      return { message: 'Successfully created product', data: newProduct };
    });
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.prismaService.product, query, {
      where: { isDelete: false },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        basePrice: true,
        discountPrice: true,
        isNew: true,
        isActive: true,
        mainImage: {
          select: { id: true, fileUrl: true, fileName: true },
        },
        _count: { select: { orderItems: true } },
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prismaService.product.findFirst({
      where: { id, isDelete: false },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        additionalDescription: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        basePrice: true,
        discountPrice: true,
        isNew: true,
        isActive: true,
        mainImage: {
          select: { id: true, fileUrl: true, fileName: true },
        },
        secondaryImage: {
          select: { id: true, fileUrl: true, fileName: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        subCategory: {
          select: { id: true, name: true, slug: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        variants: {
          where: { isDelete: false },
          select: {
            id: true,
            price: true,
            stock: true,
            color: { select: { id: true, name: true, hex: true } },
            size: { select: { id: true, name: true } },
          },
        },
        gallery: {
          select: {
            id: true,
            media: { select: { id: true, fileUrl: true, fileName: true } },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Requested product not found.');
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    userId?: string,
  ) {
    // 1. Fail-fast validation (Check for title/slug conflicts)
    const exists = await this.prismaService.product.findFirst({
      where: {
        OR: [
          { title: updateProductDto.title },
          { slug: updateProductDto.slug },
        ],
        NOT: { id },
      },
    });

    if (exists) {
      throw new ConflictException('Title or slug already exists.');
    }

    return this.prismaService.$transaction(async (tx) => {
      const oldProduct = await tx.product.findUnique({
        where: { id },
        include: {
          gallery: true,
          variants: true,
        },
      });

      if (!oldProduct || oldProduct.isDelete) {
        throw new NotFoundException('Requested product not found.');
      }

      const { galleryMediaIds, variants, ...scalarData } = updateProductDto;

      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          title: scalarData.title,
          slug: scalarData.slug,
          description: scalarData.description,
          shortDescription: scalarData.shortDescription,
          additionalDescription: scalarData.additionalDescription,
          metaTitle: scalarData.metaTitle,
          metaDescription: scalarData.metaDescription,
          metaKeywords: scalarData.metaKeywords,
          basePrice: scalarData.basePrice,
          discountPrice: scalarData.discountPrice,
          isNew: scalarData.isNew,
          isActive: scalarData.isActive,
          mainImage: scalarData.mainImageId
            ? { connect: { id: scalarData.mainImageId } }
            : undefined,
          secondaryImage: scalarData.secondaryImageId
            ? { connect: { id: scalarData.secondaryImageId } }
            : undefined,
          category: scalarData.categoryId
            ? { connect: { id: scalarData.categoryId } }
            : undefined,
          subCategory: scalarData.subCategoryId
            ? { connect: { id: scalarData.subCategoryId } }
            : undefined,
        },
      });

      if (galleryMediaIds) {
        const currentMediaIds = oldProduct.gallery.map((g) => g.mediaId);

        // Find which records to delete and which to add
        const toDelete = currentMediaIds.filter(
          (mediaId) => !galleryMediaIds.includes(mediaId),
        );
        const toCreate = galleryMediaIds.filter(
          (mediaId) => !currentMediaIds.includes(mediaId),
        );

        if (toDelete.length > 0) {
          await tx.productGallery.deleteMany({
            where: { productId: id, mediaId: { in: toDelete } },
          });
        }

        if (toCreate.length > 0) {
          await tx.productGallery.createMany({
            data: toCreate.map((mediaId) => ({ productId: id, mediaId })),
          });
        }
      }

      if (variants) {
        const existingVariants = oldProduct.variants;
        const incomingVariantKeys = new Set<string>();

        const updates: Promise<any>[] = [];
        const toCreate: Prisma.ProductVariantCreateManyInput[] = [];

        for (const v of variants) {
          const key = `${v.colorId ?? 'null'}-${v.sizeId ?? 'null'}`;
          incomingVariantKeys.add(key);

          const match = existingVariants.find(
            (ev) =>
              ev.colorId === (v.colorId ?? null) &&
              ev.sizeId === (v.sizeId ?? null),
          );

          if (match) {
            updates.push(
              tx.productVariant.update({
                where: { id: match.id },
                data: { price: v.price, stock: v.stock ?? 0 },
              }),
            );
          } else {
            toCreate.push({
              productId: id,
              price: v.price,
              stock: v.stock ?? 0,
              colorId: v.colorId ?? null,
              sizeId: v.sizeId ?? null,
            });
          }
        }

        const toDeleteIds = existingVariants
          .filter((ev) => {
            const key = `${ev.colorId ?? 'null'}-${ev.sizeId ?? 'null'}`;
            return !incomingVariantKeys.has(key);
          })
          .map((ev) => ev.id);

        if (toDeleteIds.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: toDeleteIds } },
          });
        }

        if (updates.length > 0) await Promise.all(updates);
        if (toCreate.length > 0)
          await tx.productVariant.createMany({ data: toCreate });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.UPDATE,
          entity: EntityType.PRODUCT,
          entityId: updatedProduct.id,
          oldData: JSON.stringify(oldProduct),
          newData: JSON.stringify(updatedProduct),
        },
      });

      return {
        message: `Successfully updated product '${updatedProduct.title}'`,
        data: updatedProduct,
      };
    });
  }

  async remove(id: number, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const oldProduct = await tx.product.findUnique({ where: { id } });

      if (!oldProduct || oldProduct.isDelete) {
        throw new NotFoundException('Requested product not found.');
      }

      await tx.product.update({
        where: { id },
        data: { isDelete: true },
      });

      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.DELETE,
          entity: EntityType.PRODUCT,
          entityId: oldProduct.id,
          oldData: JSON.stringify(oldProduct),
        },
      });

      return { message: `Successfully deleted product '${oldProduct.title}'` };
    });
  }
}
