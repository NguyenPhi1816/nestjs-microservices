import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseProductImagesResponseDto } from './dto/base-product-image-response.dto';
import { BaseProductResponseDto } from './dto/base-product-response.dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import { BaseProductStatus } from 'src/constants/base-product-status.enum';
import { CreateBaseProductDto } from './dto/create-base-product.dto';
import { RpcException } from '@nestjs/microservices';
import { CreateOptionValuesDto } from './dto/create-option-values.dto';
import { OptionValuesResponseDto } from './dto/option-values-response.dto';
import { OptionValuesDto } from './dto/option-values.dto';
import { OptionValue } from '@prisma/client';
import { ValueResponseDto } from './dto/value-resoponse.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';
import { OptionValueResponseDto } from './dto/option-value-response.dto';
import { BaseProductDAO } from './product.dao';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private baseProductDAO: BaseProductDAO,
  ) {}

  async getAllBaseProduct(): Promise<BaseProductResponseDto[]> {
    try {
      const baseProducts = await this.baseProductDAO.findAllBaseProducts();

      const responses: BaseProductResponseDto[] = baseProducts.map((item) => {
        const categories: string[] = item.baseProductCategories.map(
          (baseProductCategory) => baseProductCategory.category.name,
        );

        return {
          id: item.id,
          slug: item.slug,
          name: item.name,
          categories: categories,
          brand: item.brand.name,
          status: item.status,
        };
      });
      return responses;
    } catch (error) {
      throw error;
    }
  }

  async createBaseProduct(
    createBaseProductDto: CreateBaseProductDto,
  ): Promise<BaseProductResponseDto> {
    try {
      // start transaction for multi query
      const newBaseProduct = await this.prisma.$transaction(async (prisma) => {
        // save base product
        const createBaseProductData = {
          name: createBaseProductDto.name,
          slug: normalizeName(createBaseProductDto.name),
          description: createBaseProductDto.description,
          status: BaseProductStatus.ACTIVE,
          brandId: createBaseProductDto.brandId,
        };
        const baseProduct = await this.baseProductDAO.createBaseProduct(
          createBaseProductData,
          prisma,
        );

        // add product to category
        const baseProductCategoryPromises =
          createBaseProductDto.categoryIds.map((categoryId) =>
            this.baseProductDAO.addProductToCategory(
              baseProduct.id,
              categoryId,
              prisma,
            ),
          );
        const baseProductCategories = await Promise.all(
          baseProductCategoryPromises,
        );

        // save all images from base product
        const imagePromises = createBaseProductDto.images.map((path, index) =>
          this.baseProductDAO.addProductImage(
            baseProduct.id,
            path,
            index === 0,
            prisma,
          ),
        );
        await Promise.all(imagePromises);

        const response: BaseProductResponseDto = {
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
      console.log(error.code);

      if (error.code === 'P2002') {
        throw new RpcException(
          new ConflictException('Product name must be unique'),
        );
      } else {
        throw error;
      }
    }
  }

  async createOptionValues(
    createOptionValuesRequestDto: CreateOptionValuesDto,
  ): Promise<OptionValuesResponseDto[]> {
    try {
      // begin a transaction
      const newOptionValues = await this.prisma.$transaction(async (prisma) => {
        // save all options
        const options: string[] = createOptionValuesRequestDto.optionValues.map(
          (optionValue) => optionValue.option,
        );

        const createOptionQueries = options.map((option) =>
          prisma.option.create({
            data: {
              baseProductId: createOptionValuesRequestDto.baseProductId,
              name: option,
            },
          }),
        );
        const savedOptions = await Promise.all(createOptionQueries);

        // save all option values
        const createOptionValuesQueries = [];
        savedOptions.map((savedOption) => {
          const optionValues: OptionValuesDto =
            createOptionValuesRequestDto.optionValues.find(
              (optionValue) => optionValue.option === savedOption.name,
            );
          optionValues.values.map((value) => {
            const createOptionValuesQuery = prisma.optionValue.create({
              data: {
                optionId: savedOption.id,
                value: value,
              },
            });
            createOptionValuesQueries.push(createOptionValuesQuery);
          });
        });
        const savedOptionValues: OptionValue[] = await Promise.all(
          createOptionValuesQueries,
        );

        // prepare a response
        const response: OptionValuesResponseDto[] = savedOptions.map(
          (savedOption) => {
            const values: ValueResponseDto[] = [];
            savedOptionValues.forEach((savedOptionValue) => {
              if (savedOptionValue.optionId === savedOption.id) {
                values.push({
                  valueId: savedOptionValue.id,
                  valueName: savedOptionValue.value,
                });
              }
            });
            return {
              optionId: savedOption.id,
              optionName: savedOption.name,
              values: values,
            };
          },
        );
        return response;
      });
      return newOptionValues;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Option already exists.');
      } else {
        throw error;
      }
    }
  }

  async createProductVariant(
    createProductVariantRequestDto: CreateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    try {
      const response = await this.prisma.$transaction(async (prisma) => {
        const productVariant = await prisma.productVariant.create({
          data: {
            baseProductId: createProductVariantRequestDto.baseProductId,
            image: createProductVariantRequestDto.image,
            quantity: createProductVariantRequestDto.quantity,
            price: createProductVariantRequestDto.price,
          },
          select: {
            id: true,
            image: true,
            quantity: true,
            price: true,
          },
        });

        const optionValueVariantPromises =
          createProductVariantRequestDto.optionValueIds.map((optionValueId) =>
            prisma.optionValueVariant.create({
              data: {
                optionValueId: optionValueId,
                productVariantId: productVariant.id,
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
            }),
          );

        const optionValueVariants = await Promise.all(
          optionValueVariantPromises,
        );
        const optionValue: OptionValueResponseDto[] = optionValueVariants.map(
          (optionValueVariant) => {
            return {
              option: optionValueVariant.optionValue.option.name,
              value: optionValueVariant.optionValue.value,
            };
          },
        );
        const response: ProductVariantResponseDto = {
          ...productVariant,
          optionValue,
        };

        return response;
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}
