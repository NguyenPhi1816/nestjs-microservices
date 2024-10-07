import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BaseProductDAO {
  constructor(private prisma: PrismaService) {}

  async findAllBaseProducts() {
    return this.prisma.baseProduct.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        brand: true,
        status: true,
        baseProductCategories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async createBaseProduct(data: any, prisma: any = this.prisma) {
    return prisma.baseProduct.create({
      data,
      include: {
        brand: true,
      },
    });
  }

  async addProductToCategory(
    baseProductId: number,
    categoryId: number,
    prisma: any = this.prisma,
  ) {
    return prisma.baseProductCategory.create({
      data: { baseProductId, categoryId },
      include: {
        category: true,
      },
    });
  }

  async addProductImage(
    baseProductId: number,
    image: string,
    isDefault: boolean,
    prisma: any = this.prisma,
  ) {
    return prisma.baseProductImage.create({
      data: {
        baseProductId,
        path: image,
        isDefault,
      },
    });
  }
}
