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
        const BP_Images_Promises = data.images.map((path, index) =>
          this.baseProductDAO.addProductImage(
            baseProduct.id,
            path,
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
}
