import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandProductDto } from './dto/brand-product.dto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async getAllBrands() {
    const brands = await this.prisma.brand.findMany({
      include: {
        _count: {
          select: {
            baseProducts: true,
          },
        },
      },
    });
    const response: BrandResponseDto[] = brands.map((brand) => ({
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      image: brand.image,
      imageId: brand.imageId,
      numberOfProducts: brand._count.baseProducts,
    }));
    return response;
  }

  async createBrand(createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
    try {
      const brand = await this.prisma.brand.create({
        data: {
          name: createBrandDto.name,
          slug: normalizeName(createBrandDto.name),
          image: createBrandDto.image,
          imageId: createBrandDto.imageId,
        },
        include: {
          _count: {
            select: {
              baseProducts: true,
            },
          },
        },
      });
      const response: BrandResponseDto = {
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        image: brand.image,
        imageId: brand.imageId,
        numberOfProducts: brand._count.baseProducts,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateBrand(updateBrandDto: UpdateBrandDto): Promise<BrandResponseDto> {
    try {
      const brand = await this.prisma.brand.update({
        where: {
          id: updateBrandDto.id,
        },
        data: {
          name: updateBrandDto.name,
          slug: normalizeName(updateBrandDto.name),
          image: updateBrandDto.image,
          imageId: updateBrandDto.imageId,
        },
        include: {
          _count: {
            select: {
              baseProducts: true,
            },
          },
        },
      });
      const response: BrandResponseDto = {
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        image: brand.image,
        imageId: brand.imageId,
        numberOfProducts: brand._count.baseProducts,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getBrandProducts(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug: slug },
      select: {
        baseProducts: {
          select: {
            id: true,
            slug: true,
            name: true,
            baseProductCategories: {
              select: {
                category: {
                  select: {
                    id: true,
                    slug: true,
                    name: true,
                  },
                },
              },
            },
            brand: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
            status: true,
          },
        },
      },
    });
    const response: BrandProductDto[] = brand.baseProducts.map((product) => {
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.baseProductCategories.map((baseProductCategory) => {
          const category = baseProductCategory.category;
          return {
            id: category.id,
            slug: category.slug,
            name: category.name,
          };
        }),
        brand: product.brand,
        status: product.status,
      };
    });
    return response;
  }
}
