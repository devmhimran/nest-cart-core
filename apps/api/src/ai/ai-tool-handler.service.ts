import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiToolHandlerService {
  constructor(private prisma: PrismaService) {}

  async handleToolCall(name: string, args: { query: string }) {
    switch (name) {
      case 'search_categories_and_subcategories':
        return this.searchCategories(args.query);
      case 'search_colors_and_sizes':
        return this.searchAttributes(args.query);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async searchCategories(query: string) {
    const [categories, subCategories] = await Promise.all([
      this.prisma.category.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          isDelete: false,
        },
        select: { id: true, name: true, slug: true },
      }),
      this.prisma.subCategory.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          isDelete: false,
        },
        select: { id: true, name: true, categoryId: true },
      }),
    ]);
    return { categories, subCategories };
  }

  private async searchAttributes(query: string) {
    const [colors, sizes] = await Promise.all([
      this.prisma.color.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: { id: true, name: true, hex: true },
      }),
      this.prisma.size.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: { id: true, name: true },
      }),
    ]);
    return { colors, sizes };
  }
}
