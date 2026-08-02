import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiToolHandlerService {
  constructor(private prisma: PrismaService) {}

  async handleToolCall(name: string, args: { query?: string }) {
    switch (name) {
      case 'search_categories_and_subcategories':
        return this.searchCategories(args.query);
      case 'search_colors_and_sizes':
        return this.searchAttributes(args.query);
      case 'search_products':
        return this.searchProducts(args.query);
      case 'search_promo_codes':
        return this.searchPromoCodes(args.query);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private getSearchFilter(query?: string, searchFields: string[] = ['name']) {
    if (
      !query ||
      query.trim() === '' ||
      query.toLowerCase() === 'all' ||
      query.toLowerCase() === 'list'
    ) {
      return {};
    }
    const cleanQuery = query.trim();
    if (searchFields.length === 1) {
      return {
        [searchFields[0]]: {
          contains: cleanQuery,
          mode: 'insensitive' as const,
        },
      };
    }
    return {
      OR: searchFields.map((field) => ({
        [field]: { contains: cleanQuery, mode: 'insensitive' as const },
      })),
    };
  }

  private async searchCategories(query?: string) {
    const filter = this.getSearchFilter(query, ['name', 'slug']);
    const [categories, subCategories] = await Promise.all([
      this.prisma.category.findMany({
        where: {
          ...filter,
          isDelete: false,
        },
        select: { id: true, name: true, slug: true, imageId: true },
      }),
      this.prisma.subCategory.findMany({
        where: {
          ...filter,
          isDelete: false,
        },
        select: { id: true, name: true, slug: true, categoryId: true },
      }),
    ]);
    return { categories, subCategories };
  }

  private async searchAttributes(query?: string) {
    const filter = this.getSearchFilter(query, ['name']);
    const [colors, sizes] = await Promise.all([
      this.prisma.color.findMany({
        where: filter,
        select: { id: true, name: true, hex: true },
      }),
      this.prisma.size.findMany({
        where: filter,
        select: { id: true, name: true },
      }),
    ]);
    return { colors, sizes };
  }

  private async searchProducts(query?: string) {
    const filter = this.getSearchFilter(query, ['title', 'slug']);
    const products = await this.prisma.product.findMany({
      where: {
        ...filter,
        isDelete: false,
      },
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
        categoryId: true,
        subCategoryId: true,
      },
    });
    return { products };
  }

  private async searchPromoCodes(query?: string) {
    const filter = this.getSearchFilter(query, ['code', 'title']);
    const promoCodes = await this.prisma.promoCode.findMany({
      where: filter,
      select: {
        id: true,
        code: true,
        title: true,
        amount: true,
        startDate: true,
        endDate: true,
      },
    });
    return { promoCodes };
  }
}
