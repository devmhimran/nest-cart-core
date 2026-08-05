import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiToolHandlerService {
  private readonly logger = new Logger(AiToolHandlerService.name);
  private readonly DEFAULT_LIMIT = 15;

  constructor(private prisma: PrismaService) {}

  async handleToolCall(name: string, args: { query?: string }) {
    this.logger.debug(`Tool called: ${name}, args: ${JSON.stringify(args)}`);

    switch (name) {
      case 'search_categories':
        return this.searchCategories(args.query);

      case 'search_subcategories':
        return this.searchSubCategories(args.query);

      case 'search_colors':
        return this.searchColors(args.query);

      case 'search_sizes':
        return this.searchSizes(args.query);

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

    const cleanQuery = query.trim().replace(/^["']|["']$/g, '');

    if (searchFields.length === 1) {
      return {
        [searchFields[0]]: {
          contains: cleanQuery,
          mode: 'insensitive' as const,
        },
      };
    }
    this.logger.debug(
      `Searching for "${cleanQuery}" in fields: ${searchFields.join(', ')}`,
    );
    return {
      OR: searchFields.map((field) => ({
        [field]: { contains: cleanQuery, mode: 'insensitive' as const },
      })),
    };
  }

  private async searchCategories(query?: string) {
    const filter = this.getSearchFilter(query, ['name', 'slug']);

    const categories = await this.prisma.category.findMany({
      where: {
        ...filter,
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageId: true,
      },
      take: this.DEFAULT_LIMIT,
    });

    return {
      items: categories.map((category) => ({
        ...category,
        entityType: 'category',
      })),
      count: categories.length,
    };
  }

  private async searchSubCategories(query?: string) {
    const filter = this.getSearchFilter(query, ['name', 'slug']);

    const subCategories = await this.prisma.subCategory.findMany({
      where: {
        ...filter,
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true,
      },
      take: this.DEFAULT_LIMIT,
    });

    return {
      items: subCategories.map((subCategory) => ({
        ...subCategory,
        entityType: 'subCategory',
      })),
      count: subCategories.length,
    };
  }

  private async searchColors(query?: string) {
    const filter = this.getSearchFilter(query, ['name', 'hex']);

    const colors = await this.prisma.color.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        hex: true,
      },
      take: this.DEFAULT_LIMIT,
    });

    return {
      items: colors.map((color) => ({
        ...color,
        entityType: 'color',
      })),
      count: colors.length,
    };
  }

  private async searchSizes(query?: string) {
    const filter = this.getSearchFilter(query, ['name']);

    const sizes = await this.prisma.size.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
      },
      take: this.DEFAULT_LIMIT,
    });

    return {
      items: sizes.map((size) => ({
        ...size,
        entityType: 'size',
      })),
      count: sizes.length,
    };
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
      take: this.DEFAULT_LIMIT,
    });

    const items = products.map((p) => ({ ...p, entityType: 'product' }));
    return { items, count: items.length };
  }

  private async searchPromoCodes(query?: string) {
    const filter = this.getSearchFilter(query, ['code', 'title']);
    this.logger.debug(`Promo code search filter: ${JSON.stringify(filter)}`);
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
      take: this.DEFAULT_LIMIT,
    });

    const items = promoCodes.map((p) => ({ ...p, entityType: 'promoCode' }));
    this.logger.debug(`Promo code search results: ${items.length} found`);
    return { items, count: items.length };
  }
}
