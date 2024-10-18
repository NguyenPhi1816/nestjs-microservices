import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Create_BP_Result from './dto/base-product-results/create-BP-result.dto';
import { List_BP_Admin_Res } from './dto/base-product-responses/list-BP-admin.dto';
import { Create_BP_Cate_Result } from './dto/base-product-results/create-BP-cate-result.dto';
import Create_PV_Result from './dto/product-variant-result/create-PV-result.dto';
import { OV_Res } from './dto/option-value-responses/OV.dto';
import { Detail_BP_Admin_Res } from './dto/base-product-responses/detail-BP-admin.dto';
import { PV_Res } from './dto/product-variant-responses/PV.dto';
import OVs_Res from './dto/option-value-responses/OVs.dto';

@Injectable()
export class BaseProductDAO {
  constructor(private prisma: PrismaService) {}

  async findAllBaseProducts(): Promise<List_BP_Admin_Res[]> {
    const products = await this.prisma.baseProduct.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        brand: {
          select: {
            name: true,
          },
        },
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

    const res = products.map((item): List_BP_Admin_Res => {
      return {
        id: item.id,
        slug: item.slug,
        name: item.name,
        status: item.status,
        brand: item.brand.name,
        categories: item.baseProductCategories.map((bpc) => bpc.category.name),
      };
    });

    return res;
  }

  async createBaseProduct(
    data: any,
    prisma: any = this.prisma,
  ): Promise<Create_BP_Result> {
    const result = await prisma.baseProduct.create({
      data,
      include: {
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: result.id,
      slug: result.slug,
      name: result.name,
      status: result.status,
      brand: result.brand.name,
    };
  }

  async addProductToCategory(
    baseProductId: number,
    categoryId: number,
    prisma: any = this.prisma,
  ): Promise<Create_BP_Cate_Result> {
    const result = await prisma.baseProductCategory.create({
      data: { baseProductId, categoryId },
      select: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    return {
      name: result.category.name,
    };
  }

  async addProductImage(
    baseProductId: number,
    image: string,
    imageId: string,
    isDefault: boolean,
    prisma: any = this.prisma,
  ) {
    return await prisma.baseProductImage.create({
      data: {
        baseProductId,
        path: image,
        publicId: imageId,
        isDefault,
      },
      select: {
        id: true,
        path: true,
        publicId: true,
        isDefault: true,
      },
    });
  }

  async setBPMainImage(baseProductId: number, imageId: number) {
    try {
      await this.prisma.$transaction(async (prisma) => {
        console.log(baseProductId, imageId);
        // Bước 1: Đặt isDefault = false cho hình ảnh đang là default với baseProductId
        await prisma.baseProductImage.updateMany({
          where: {
            baseProductId: baseProductId,
            isDefault: true,
          },
          data: { isDefault: false },
        });

        // Bước 2: Đặt isDefault = true cho hình ảnh mới
        await prisma.baseProductImage.update({
          where: { id: imageId }, // Đảm bảo bạn chỉ cập nhật ảnh với imageId đúng
          data: { isDefault: true },
        });
      });

      return 1;
    } catch (error) {
      console.error('Error setting main image:', error);
      return -1;
    }
  }

  async deleteProductImage(publicId: string) {
    return this.prisma.baseProductImage.delete({
      where: { publicId: publicId },
    });
  }

  async getBaseProductDetailBySlugAdmin(
    slug: string,
  ): Promise<Detail_BP_Admin_Res> {
    const result = await this.prisma.baseProduct.findUnique({
      where: { slug: slug },
      include: {
        baseProductCategories: {
          select: {
            category: {
              select: {
                id: true,
              },
            },
          },
        },
        brand: {
          select: {
            id: true,
          },
        },
        images: {
          select: {
            id: true,
            path: true,
            isDefault: true,
            publicId: true,
          },
        },
        productVariants: {
          select: {
            id: true,
            image: true,
            imageId: true,
            quantity: true,
            optionValueVariants: {
              select: {
                optionValue: {
                  select: {
                    option: {
                      select: {
                        name: true,
                      },
                    },
                    value: true,
                  },
                },
                optionValueId: true,
              },
            },
            prices: {
              take: 1, // Get only the most recent price
              orderBy: {
                createdAt: 'desc',
              },
              select: {
                price: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // get product variants from base product
    const productVariants: PV_Res[] = result.productVariants.map((variant) => {
      const optionValue: OV_Res[] = [];

      variant.optionValueVariants.map((item) =>
        optionValue.push({
          option: item.optionValue.option.name,
          value: item.optionValue.value,
        }),
      );

      return {
        id: variant.id,
        image: variant.image,
        imageId: variant.imageId,
        quantity: variant.quantity,
        optionValue: optionValue,
        price: variant.prices.length > 0 ? variant.prices[0].price : 0,
      };
    });

    // get option values
    const optionValues: OVs_Res[] = [];
    result.productVariants.map((variant) =>
      variant.optionValueVariants.map((item) => {
        const existedOptionIndex = optionValues.findIndex(
          (optionValue) => optionValue.option === item.optionValue.option.name,
        );
        if (existedOptionIndex === -1) {
          optionValues.push({
            option: item.optionValue.option.name,
            values: [item.optionValue.value],
          });
        } else {
          const existedValueIndex = optionValues[
            existedOptionIndex
          ].values.findIndex((value) => value === item.optionValue.value);
          if (existedValueIndex === -1) {
            optionValues[existedOptionIndex].values.push(
              item.optionValue.value,
            );
          }
        }
      }),
    );

    return {
      id: result.id,
      slug: result.slug,
      name: result.name,
      brandId: result.brand.id,
      description: result.description,
      images: result.images,
      status: result.status,
      categoryIds: result.baseProductCategories.map((item) => item.category.id),
      optionValues: optionValues,
      productVariants: productVariants,
    };
  }

  async createOption(
    option: string,
    baseProductId: number,
    prisma: any = this.prisma,
  ) {
    return prisma.option.create({
      data: {
        baseProductId: baseProductId,
        name: option,
      },
    });
  }

  async createOptionValue(
    optionId: number,
    value: string,
    prisma: any = this.prisma,
  ) {
    return prisma.optionValue.create({
      data: {
        optionId: optionId,
        value: value,
      },
    });
  }

  async createOptionValueVariant(
    optionValueId: number,
    productVariantId: number,
    prisma: any = this.prisma,
  ): Promise<OV_Res> {
    const result = await prisma.optionValueVariant.create({
      data: {
        optionValueId: optionValueId,
        productVariantId: productVariantId,
      },
      select: {
        optionValue: {
          select: {
            value: true,
            option: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    return {
      option: result.optionValue.option.name,
      value: result.optionValue.value,
    };
  }

  async createProductVariant(
    baseProductId: number,
    image: string,
    imageId: string,
    quantity: number,
    prisma: any = this.prisma,
  ): Promise<Create_PV_Result> {
    return prisma.productVariant.create({
      data: {
        baseProductId: baseProductId,
        image: image,
        imageId: imageId,
        quantity: quantity,
      },
      select: {
        id: true,
        image: true,
        imageId: true,
        quantity: true,
      },
    });
  }

  async updateProductVariant(
    productVariantId: number,
    image: string,
    imageId: string,
    quantity: number,
    prisma: any = this.prisma,
  ) {
    return await prisma.productVariant.update({
      where: {
        id: productVariantId,
      },
      data: {
        image: image,
        imageId: imageId,
        quantity: quantity,
      },
      select: {
        id: true,
        image: true,
        imageId: true,
        quantity: true,
        optionValueVariants: {
          select: {
            optionValue: {
              select: {
                value: true,
                option: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        prices: {
          take: 1, // Get only the most recent price
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            price: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async createProductVariantPrice(
    productVariantId: number,
    price: number,
    prisma: any = this.prisma,
  ): Promise<number> {
    const _price = await prisma.price.create({
      data: {
        price: price,
        productVariantId: productVariantId,
      },
    });
    return _price.price as number;
  }
}
