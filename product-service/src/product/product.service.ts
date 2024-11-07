import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { normalizeName } from 'src/utils/normalize-name.util';
import { BaseProductStatus } from 'src/constants/base-product-status.enum';
import { RpcException } from '@nestjs/microservices';
import { BaseProductDAO } from './product.dao';
import { Create_BP_Req } from './dto/base-product-requests/create-BP.dto';
import Create_BP_Result from './dto/base-product-results/create-BP-result.dto';
import { Create_BP_Cate_Result } from './dto/base-product-results/create-BP-cate-result.dto';
import { List_BP_Admin_Res } from './dto/base-product-responses/list-BP-admin.dto';
import { Create_OVs } from './dto/option-value-requests/create-OVs.dto';
import { OptionValuesDto } from './dto/option-value-requests/option-values.dto';
import { OptionValue } from '@prisma/client';
import { Value_Res } from './dto/option-value-responses/value.dto';
import { PV_Res } from './dto/product-variant-responses/PV.dto';
import { Create_PV_Req } from './dto/product-variant-requests/create-product-variant.dto';
import Create_PV_Result from './dto/product-variant-result/create-PV-result.dto';
import { OV_Res } from './dto/option-value-responses/OV.dto';
import { Detail_BP_Admin_Res } from './dto/base-product-responses/detail-BP-admin.dto';
import { Create_OVs_Res } from './dto/option-value-responses/create-OVs.dto';
import Add_BP_Image_Req from './dto/base-product-requests/add-BP-image.dto';
import UpdateProductVariantDto from './dto/product-variant-requests/update-product-variant.dto';
import { Update_BP_Req } from './dto/base-product-requests/update-BP.dto';
import { Update_BP_Status_Req } from './dto/base-product-requests/update-BP-status.dto';
import { CreateOrderDetailDto } from './dto/order-detail/create-order-detail.dto';
import Update_PV_Quantity_Req from './dto/product-variant-requests/update-product-variant-quantity.dto';
import { ProductVariantResponseDto } from './dto/product-variant-responses/PV-client.dto';
import { OrderBySearchParams } from 'src/constants/orderBySearchParams';
import OVs_Res from './dto/option-value-responses/OVs.dto';
import { BaseProductResponseDto } from './dto/base-product-responses/BP.dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private baseProductDAO: BaseProductDAO,
  ) {}

  async getAllBaseProduct(): Promise<List_BP_Admin_Res[]> {
    try {
      const responses: List_BP_Admin_Res[] =
        await this.baseProductDAO.findAllBaseProducts();
      return responses;
    } catch (error) {
      throw new RpcException(new BadRequestException(error.message));
    }
  }

  async createBaseProduct(data: Create_BP_Req): Promise<List_BP_Admin_Res> {
    try {
      // start transaction for multi query
      const newBaseProduct = await this.prisma.$transaction(async (prisma) => {
        // save base product
        const payload = {
          name: data.name,
          slug: normalizeName(data.name),
          description: data.description,
          status: BaseProductStatus.ACTIVE,
          brandId: data.brandId,
        };
        const baseProduct: Create_BP_Result =
          await this.baseProductDAO.createBaseProduct(payload, prisma);

        // add product to category
        const BP_Cates_Promises = data.categoryIds.map((categoryId) =>
          this.baseProductDAO.addProductToCategory(
            baseProduct.id,
            categoryId,
            prisma,
          ),
        );
        const BP_Cates: Create_BP_Cate_Result[] =
          await Promise.all(BP_Cates_Promises);

        // save all images from base product
        const BP_Images_Promises = data.images.map((image, index) =>
          this.baseProductDAO.addProductImage(
            baseProduct.id,
            image.image,
            image.id,
            index === data.mainImageId,
            prisma,
          ),
        );
        await Promise.all(BP_Images_Promises);

        const response: List_BP_Admin_Res = {
          id: baseProduct.id,
          slug: baseProduct.slug,
          name: baseProduct.name,
          status: baseProduct.status,
          categories: BP_Cates.map((bpc) => bpc.name),
          brand: baseProduct.brand,
        };
        return response;
      });
      return newBaseProduct;
    } catch (error) {
      console.log(error);
      if (error.code === 'P2002') {
        throw new RpcException(
          new ConflictException('Product name must be unique'),
        );
      } else {
        throw new RpcException(new BadRequestException(error.message));
      }
    }
  }

  async createOptionValues(data: Create_OVs): Promise<Create_OVs_Res[]> {
    try {
      // begin a transaction
      const newOptionValues = await this.prisma.$transaction(async (prisma) => {
        // save all options
        const createOptionQueries = data.optionValues.map((optionValue) =>
          this.baseProductDAO.createOption(
            optionValue.option,
            data.baseProductId,
            prisma,
          ),
        );
        const savedOptions = await Promise.all(createOptionQueries);

        // save all value
        const createOptionValuesQueries = [];
        savedOptions.map((savedOption) => {
          const optionValues: OptionValuesDto = data.optionValues.find(
            (optionValue) => optionValue.option === savedOption.name,
          );
          optionValues.values.map((value) => {
            const createOptionValuesQuery =
              this.baseProductDAO.createOptionValue(
                savedOption.id,
                value,
                prisma,
              );
            createOptionValuesQueries.push(createOptionValuesQuery);
          });
        });
        const savedOptionValues: OptionValue[] = await Promise.all(
          createOptionValuesQueries,
        );

        // prepare a response
        const response: Create_OVs_Res[] = savedOptions.map((savedOption) => {
          const values: Value_Res[] = [];
          savedOptionValues.forEach((savedOptionValue) => {
            if (savedOptionValue.optionId === savedOption.id) {
              values.push({
                valueId: savedOptionValue.id,
                valueName: savedOptionValue.value,
              });
            }
          });
          return {
            optionId: savedOption.id as number,
            optionName: savedOption.name as string,
            values: values,
          };
        });
        return response;
      });
      return newOptionValues;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new RpcException(new ConflictException('Option already exists.'));
      } else {
        throw new RpcException(new BadRequestException(error.message));
      }
    }
  }

  async createProductVariant(data: Create_PV_Req): Promise<PV_Res> {
    try {
      const response = await this.prisma.$transaction(async (prisma) => {
        const productVariant: Create_PV_Result =
          await this.baseProductDAO.createProductVariant(
            data.baseProductId,
            data.image,
            data.imageId,
            data.quantity,
            prisma,
          );

        const optionValueVariantPromises = data.optionValueIds.map(
          (optionValueId) =>
            this.baseProductDAO.createOptionValueVariant(
              optionValueId,
              productVariant.id,
              prisma,
            ),
        );

        const optionValueVariants = await Promise.all(
          optionValueVariantPromises,
        );
        const optionValue: OV_Res[] = optionValueVariants.map(
          (optionValueVariant) => {
            return {
              option: optionValueVariant.option,
              value: optionValueVariant.value,
            };
          },
        );

        const price = await this.baseProductDAO.createProductVariantPrice(
          productVariant.id,
          data.price,
          prisma,
        );

        const response: PV_Res = {
          ...productVariant,
          optionValue,
          price: price,
        };

        return response;
      });
      return response;
    } catch (error) {
      throw new RpcException(new BadRequestException(error.message));
    }
  }

  async getBySlugAdmin(slug: string): Promise<Detail_BP_Admin_Res> {
    try {
      // query by slug
      const product =
        await this.baseProductDAO.getBaseProductDetailBySlugAdmin(slug);

      if (!product) {
        throw new RpcException(
          new NotFoundException('Không tìm thấy sản phẩm'),
        );
      }

      return product;
    } catch (error) {
      throw new RpcException(new BadRequestException(error.message));
    }
  }

  async addBaseProductImage(data: Add_BP_Image_Req) {
    const BP_Images_Promises = data.images.map((image, index) =>
      this.baseProductDAO.addProductImage(
        data.baseProductId,
        image.image,
        image.id,
        false,
      ),
    );
    return await Promise.all(BP_Images_Promises);
  }

  async deleteBaseProductImage(publicId: string) {
    try {
      return await this.baseProductDAO.deleteProductImage(publicId);
    } catch (error) {
      throw new RpcException(new NotFoundException('Không tìm thấy hình ảnh'));
    }
  }

  async setBPMainImage(baseProductId: number, imageId: number) {
    const result = await this.baseProductDAO.setBPMainImage(
      baseProductId,
      imageId,
    );

    if (result == -1) {
      throw new RpcException(new BadRequestException('Có lỗi xảy ra'));
    }

    return result;
  }

  async updateVariant(data: UpdateProductVariantDto) {
    try {
      const response = await this.prisma.$transaction(async (prisma) => {
        const productVariant = await this.baseProductDAO.updateProductVariant(
          data.productVariantId,
          data.image,
          data.imageId,
          data.quantity,
          prisma,
        );

        let price = productVariant.prices[0].price;
        if (price !== data.price) {
          price = await this.baseProductDAO.createProductVariantPrice(
            data.productVariantId,
            data.price,
            prisma,
          );
        }

        const optionValue: OV_Res[] = productVariant.optionValueVariants.map(
          (optionValueVariant) => {
            return {
              option: optionValueVariant.optionValue.option.name,
              value: optionValueVariant.optionValue.value,
            };
          },
        );
        const response: PV_Res = {
          ...productVariant,
          optionValue,
          price: price,
        };

        return response;
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateBaseProduct(data: Update_BP_Req): Promise<List_BP_Admin_Res> {
    try {
      // start transaction for multi query
      const newBaseProduct = await this.prisma.$transaction(async (prisma) => {
        // update base product
        const baseProduct = await prisma.baseProduct.update({
          where: {
            id: data.id,
          },
          data: {
            name: data.name,
            slug: normalizeName(data.name),
            description: data.description,
            status: BaseProductStatus.ACTIVE,
            brandId: data.brandId,
          },
          include: {
            brand: true,
          },
        });

        // update product category
        await prisma.baseProductCategory.deleteMany({
          where: {
            baseProductId: data.id,
          },
        });

        const baseProductCategoryPromises = data.categoryIds.map((categoryId) =>
          prisma.baseProductCategory.create({
            data: { baseProductId: baseProduct.id, categoryId: categoryId },
            include: {
              category: true,
            },
          }),
        );

        const baseProductCategories = await Promise.all(
          baseProductCategoryPromises,
        );

        const response: List_BP_Admin_Res = {
          id: baseProduct.id,
          slug: baseProduct.slug,
          name: baseProduct.name,
          status: baseProduct.status,
          categories: baseProductCategories.map(
            (baseProductCategory) => baseProductCategory.category.name,
          ),
          brand: baseProduct.brand.name,
        };
        return response;
      });
      return newBaseProduct;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new RpcException(
          new ConflictException('Tên sản phẩm phải là duy nhất'),
        );
      } else {
        throw error;
      }
    }
  }

  async updateBaseProductStatus(data: Update_BP_Status_Req) {
    try {
      const baseProduct = await this.prisma.baseProduct.update({
        where: {
          id: data.id,
        },
        data: {
          status: data.status,
        },
      });
      return baseProduct;
    } catch (error) {
      throw error;
    }
  }

  async checkProductAvailable(data: CreateOrderDetailDto[]): Promise<boolean> {
    const productVariantQueries = data.map((item) =>
      this.prisma.productVariant.findUnique({
        where: {
          id: item.productVariantId,
        },
        include: {
          baseProduct: {
            select: {
              status: true,
            },
          },
        },
      }),
    );

    const productVariants = await Promise.all(productVariantQueries);

    let isValid = productVariants.reduce(
      (prev, variant) =>
        prev && variant.baseProduct.status === BaseProductStatus.ACTIVE,
      true,
    );

    if (!isValid) {
      throw new RpcException(new ConflictException('Sản phẩm đã ngừng bán'));
    }

    isValid = data.reduce((prev, orderDetail, index) => {
      return prev && productVariants[index].quantity >= orderDetail.quantity;
    }, true);

    if (!isValid) {
      throw new RpcException(
        new ConflictException('Số lượng sản phẩm không đủ'),
      );
    }

    return true;
  }

  async getProductVariantQuantity(productVariantId: number) {
    return this.prisma.productVariant.findUnique({
      where: {
        id: productVariantId,
      },
      select: {
        quantity: true,
      },
    });
  }

  async updateProductVariantQuantity(data: Update_PV_Quantity_Req[]) {
    // update quantity
    const quantityUpdatePromises = data.map((detail) => {
      let query: Object = {};

      if (detail.type == 'increment') {
        query = { increment: detail.quantity };
      } else {
        query = { decrement: detail.quantity };
      }

      return this.prisma.productVariant.update({
        where: { id: detail.productVariantId },
        data: { quantity: query },
      });
    });
    const result = await Promise.all(quantityUpdatePromises);
    return !!result;
  }

  async getProductVariantInfor(productId: number) {
    const result = await this.prisma.productVariant.findUnique({
      where: {
        id: productId,
      },
      select: {
        baseProduct: {
          select: {
            name: true,
          },
        },
        image: true,
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
          },
        },
        prices: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            price: true,
          },
        },
      },
    });

    const response = {
      productName: result.baseProduct.name,
      productImage: result.image,
      optionValue: result.optionValueVariants.map(
        (item) => item.optionValue.option.name + ': ' + item.optionValue.value,
      ),
      price: result.prices[0].price,
    };

    return response;
  }

  async getProductVariantByBPSlug(slug: string) {
    const baseProduct = await this.prisma.baseProduct.findUnique({
      where: {
        slug: slug,
      },
      select: {
        productVariants: {
          select: {
            id: true,
            optionValueVariants: {
              select: {
                optionValue: {
                  select: {
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const response = baseProduct.productVariants.map((item) => ({
      id: item.id,
      variant: item.optionValueVariants
        .map((ovv) => ovv.optionValue.value)
        .join(', '),
    }));

    return response;
  }

  async getBaseProducts(
    whereClause: any,
    limit: number,
    page: number,
    sortBy: string,
    fromPrice?: number,
    toPrice?: number,
  ): Promise<ProductVariantResponseDto[]> {
    const baseProducts = await this.prisma.baseProduct.findMany({
      where: {
        status: BaseProductStatus.ACTIVE,
        ...whereClause,
      },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        slug: true,
        name: true,
        productVariants: {
          select: {
            id: true,
            image: true,
            prices: {
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
              select: {
                price: true,
              },
            },
          },
        },
      },
    });

    let response: ProductVariantResponseDto[] = baseProducts
      .map((baseProduct, index) => {
        const productVariant = baseProduct.productVariants[0];

        if (productVariant) {
          return {
            id: baseProduct.id,
            image: productVariant.image,
            name: baseProduct.name,
            price: productVariant.prices[0].price,
            slug: baseProduct.slug,
            variantId: productVariant.id,
            productVariantIds: baseProduct.productVariants.map(
              (item) => item.id,
            ),
            averageRating: 0,
            numberOfReviews: 0,
            numberOfPurchases: 0,
          };
        }
      })
      .filter(Boolean) as ProductVariantResponseDto[];

    if (typeof fromPrice === 'number' && typeof toPrice === 'number') {
      response = response.filter(
        (item) => item.price >= fromPrice && item.price <= toPrice,
      );
    }

    // Sort the response based on sortBy criteria
    switch (sortBy) {
      case OrderBySearchParams.PRICE_ASC:
        response.sort((a, b) => a.price - b.price);
        break;
      case OrderBySearchParams.PRICE_DESC:
        response.sort((a, b) => b.price - a.price);
        break;
      case OrderBySearchParams.BEST_SELLING:
        response.sort((a, b) => b.numberOfPurchases - a.numberOfPurchases);
        break;
      default:
        response.sort((a, b) => b.numberOfPurchases - a.numberOfPurchases);
        break;
    }

    return response;
  }

  async getProductsByCategorySlug(
    slug: string,
    fromPrice?: number,
    toPrice?: number,
    sortBy: string = 'bestSelling',
    page: number = 1,
    limit: number = 20,
  ): Promise<ProductVariantResponseDto[]> {
    const whereClause: any = {
      baseProductCategories: {
        some: {
          category: {
            slug: slug,
          },
        },
      },
    };

    // Add price filter only if both fromPrice and toPrice are valid numbers
    if (typeof fromPrice === 'number' && typeof toPrice === 'number') {
      return this.getBaseProducts(
        whereClause,
        limit,
        page,
        sortBy,
        fromPrice,
        toPrice,
      );
    }

    return this.getBaseProducts(whereClause, limit, page, sortBy);
  }

  async getProductsByBrandSlug(
    slug: string,
    fromPrice?: number,
    toPrice?: number,
    sortBy: string = 'bestSelling',
    page: number = 1,
    limit: number = 20,
  ): Promise<ProductVariantResponseDto[]> {
    page = page ?? 1;
    limit = limit ?? 20;

    const whereClause = {
      brand: {
        slug: slug,
      },
    };

    if (typeof fromPrice === 'number' && typeof toPrice === 'number') {
      return this.getBaseProducts(
        whereClause,
        limit,
        page,
        sortBy,
        fromPrice,
        toPrice,
      );
    }

    return this.getBaseProducts(whereClause, limit, page, sortBy);
  }

  async searchProductByName(
    name: string,
    fromPrice?: number,
    toPrice?: number,
    sortBy: string = OrderBySearchParams.BEST_SELLING,
    page: number = 1,
    limit: number = 20,
  ): Promise<ProductVariantResponseDto[]> {
    const whereClause: any = {
      name: {
        contains: name,
        mode: 'insensitive',
      },
    };

    if (typeof fromPrice === 'number' && typeof toPrice === 'number') {
      return this.getBaseProducts(
        whereClause,
        limit,
        page,
        sortBy,
        fromPrice,
        toPrice,
      );
    }

    return this.getBaseProducts(whereClause, limit, page, sortBy);
  }

  async getBySlug(slug: string) {
    try {
      // query by slug
      const product = await this.prisma.baseProduct.findUnique({
        where: { slug: slug },
        include: {
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
          brand: true,
          images: {
            select: {
              id: true,
              path: true,
              isDefault: true,
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
                take: 1,
                orderBy: {
                  createdAt: 'desc',
                },
                select: {
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        throw new RpcException(
          new NotFoundException('Không tìm thấy sản phẩm'),
        );
      }

      // get relate products by getting products from base product category, limit is 5 items
      const productsByCategorySlug = await this.getProductsByCategorySlug(
        product.baseProductCategories[0].category.slug,
        6,
      );

      // remove this product from related product
      let relatedProducts = [...productsByCategorySlug];
      const isProductContained = productsByCategorySlug
        .map((p) => p.id)
        .includes(product.id);
      if (isProductContained) {
        relatedProducts = relatedProducts.filter(
          (item) => item.id !== product.id,
        );
      } else {
        relatedProducts = relatedProducts.slice(0, 5);
      }

      // get product variants from base product
      const productVariants: PV_Res[] = product.productVariants.map(
        (variant) => {
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
            price: variant.prices[0].price,
          };
        },
      );

      // get option values
      const optionValues: OVs_Res[] = [];

      product.productVariants.map((variant) =>
        variant.optionValueVariants.map((item) => {
          const existedOptionIndex = optionValues.findIndex(
            (optionValue) =>
              optionValue.option === item.optionValue.option.name,
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

      // response
      const response: BaseProductResponseDto = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        categories: product.baseProductCategories.map(
          (baseProductCategory) => baseProductCategory.category,
        ),
        brand: product.brand,
        status: product.status,
        averageRating: 0,
        numberOfPurchases: 0,
        numberOfReviews: 0,
        images: product.images,
        optionValues: optionValues,
        relatedProducts: relatedProducts,
        productVariants: productVariants,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }
}
