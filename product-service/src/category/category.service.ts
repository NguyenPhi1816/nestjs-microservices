import { ConflictException, Injectable } from '@nestjs/common';
import CreateCategoryDto from './dto/create-category.dto';
import CategoryResponseDto from './dto/category-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { normalizeName } from 'src/utils/normalize-name.util';
import { RpcException } from '@nestjs/microservices';
import UpdateCategoryDto from './dto/update-category.dto';

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
          slug: normalizeName(dto.name),
          description: dto.description,
          parentId: dto.parentId,
        },
        select: {
          id: true,
          slug: true,
          name: true,
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
}
