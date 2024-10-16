import { ConflictException, Injectable } from '@nestjs/common';
import CreateCategoryDto from './dto/create-category.dto';
import CategoryResponseDto from './dto/category-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { normalizeName } from 'src/utils/normalize-name.util';
import { RpcException } from '@nestjs/microservices';
import UpdateCategoryDto from './dto/update-category.dto';
import { CategoryProductsDto } from './dto/category-products.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        imageId: true,
        description: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            baseProductCategories: true,
            children: true,
          },
        },
      },
    });
    const response: CategoryResponseDto[] = categories.map((category) => {
      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        image: category.image,
        imageId: category.imageId,
        description: category.description,
        parent: category.parent,
        numberOfBaseProduct: category._count.baseProductCategories,
        numberOfChildren: category._count.children,
      };
    });
    return response;
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    try {
      const category = await this.prisma.category.create({
        data: {
          name: dto.name,
          image: dto.image,
          imageId: dto.imageId,
          slug: normalizeName(dto.name),
          description: dto.description,
          parentId: dto.parentId,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          imageId: true,
          image: true,
          description: true,
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              baseProductCategories: true,
              children: true,
            },
          },
        },
      });
      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        image: category.image,
        imageId: category.imageId,
        description: category.description,
        parent: category.parent,
        numberOfBaseProduct: category._count.baseProductCategories,
        numberOfChildren: category._count.children,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new RpcException(
          new ConflictException('Tên danh mục đã tồn tại'),
        );
      } else {
        throw error;
      }
    }
  }

  async updateCategory(updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.category.update({
        where: { id: updateCategoryDto.id },
        data: {
          name: updateCategoryDto.name,
          slug: normalizeName(updateCategoryDto.name),
          image: updateCategoryDto.image,
          imageId: updateCategoryDto.imageId,
          description: updateCategoryDto.description,
          parentId: updateCategoryDto.parentId,
        },
      });
      return category;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Tên danh mục đã tồn tại');
      } else {
        throw error;
      }
    }
  }

  async getCategoryChildren(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        slug: slug,
      },
      select: {
        children: {
          select: {
            id: true,
            slug: true,
            name: true,
            image: true,
            imageId: true,
            description: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                baseProductCategories: true,
                children: true,
              },
            },
          },
        },
      },
    });
    const response: CategoryResponseDto[] = category.children.map(
      (category) => {
        return {
          id: category.id,
          slug: category.slug,
          name: category.name,
          image: category.image,
          imageId: category.imageId,
          description: category.description,
          parent: category.parent,
          numberOfBaseProduct: category._count.baseProductCategories,
          numberOfChildren: category._count.children,
        };
      },
    );
    return response;
  }

  async getCategoryProducts(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        slug: slug,
      },
      select: {
        baseProductCategories: {
          select: {
            baseProduct: {
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
        },
      },
    });
    const response: CategoryProductsDto[] = category.baseProductCategories.map(
      (baseProductCategory) => {
        const product = baseProductCategory.baseProduct;
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
      },
    );
    return response;
  }
}
