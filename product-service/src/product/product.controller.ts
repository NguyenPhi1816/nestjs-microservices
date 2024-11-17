import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern } from '@nestjs/microservices';
import { Create_BP_Req } from './dto/base-product-requests/create-BP.dto';
import { Create_OVs } from './dto/option-value-requests/create-OVs.dto';
import { Create_PV_Req } from './dto/product-variant-requests/create-product-variant.dto';
import UpdateProductVariantDto from './dto/product-variant-requests/update-product-variant.dto';
import { Update_BP_Req } from './dto/base-product-requests/update-BP.dto';
import { Update_BP_Status_Req } from './dto/base-product-requests/update-BP-status.dto';
import { CreateOrderDetailDto } from './dto/order-detail/create-order-detail.dto';
import Update_PV_Quantity_Req from './dto/product-variant-requests/update-product-variant-quantity.dto';
import PriceChangeStatisticsDto from './dto/product-variant-requests/price-change-statistic.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'get-all-base-products' })
  getAllBaseProducts() {
    return this.productService.getAllBaseProduct();
  }

  @MessagePattern({ cmd: 'get-base-product-by-ids' })
  getBaseProductByIds(ids: number[]) {
    return this.productService.getBaseProductByIds(ids);
  }

  @MessagePattern({ cmd: 'get-base-product-by-slug' })
  getBaseProductBySlug(slug: string) {
    return this.productService.getBySlugAdmin(slug);
  }

  @MessagePattern({ cmd: 'create-base-product' })
  createBaseProduct(data: Create_BP_Req) {
    return this.productService.createBaseProduct(data);
  }

  @MessagePattern({ cmd: 'update-base-product' })
  updateBaseProduct(data: Update_BP_Req) {
    return this.productService.updateBaseProduct(data);
  }

  @MessagePattern({ cmd: 'create-option-values' })
  createOptionValues(data: Create_OVs) {
    return this.productService.createOptionValues(data);
  }

  @MessagePattern({ cmd: 'create-product-variant' })
  createProductVariant(data: Create_PV_Req) {
    return this.productService.createProductVariant(data);
  }

  @MessagePattern({ cmd: 'update-product-variant' })
  updateProductVariant(data: UpdateProductVariantDto) {
    return this.productService.updateVariant(data);
  }

  @MessagePattern({ cmd: 'delete-base-product-image' })
  deleteBPImage(publicId: string) {
    return this.productService.deleteBaseProductImage(publicId);
  }

  @MessagePattern({ cmd: 'add-base-product-image' })
  addBPImage(data: any) {
    return this.productService.addBaseProductImage(data);
  }

  @MessagePattern({ cmd: 'set-base-product-main-image' })
  setBPMainImage(data: { baseProductId: number; imageId: number }) {
    return this.productService.setBPMainImage(data.baseProductId, data.imageId);
  }

  @MessagePattern({ cmd: 'update-base-product-status' })
  updateBPStatus(data: Update_BP_Status_Req) {
    return this.productService.updateBaseProductStatus(data);
  }

  @MessagePattern({ cmd: 'check-product-available' })
  checkProductAvailable(data: CreateOrderDetailDto[]) {
    return this.productService.checkProductAvailable(data);
  }

  @MessagePattern({ cmd: 'update-product-variant-quantity' })
  updateProductVariantQuantity(data: Update_PV_Quantity_Req[]) {
    return this.productService.updateProductVariantQuantity(data);
  }

  @MessagePattern({ cmd: 'get-product-variant-infor' })
  getProductVariantInfor(productId: number) {
    return this.productService.getProductVariantInfor(productId);
  }

  @MessagePattern({ cmd: 'get-product-variant-quantity' })
  getProductVariantQuantity(productId: number) {
    return this.productService.getProductVariantQuantity(productId);
  }

  @MessagePattern({ cmd: 'get-product-variant-by-base-product-slug' })
  getPVByBPSlug(slug: string) {
    return this.productService.getProductVariantByBPSlug(slug);
  }

  @MessagePattern({ cmd: 'get-base-product-by-slug-client' })
  getBPBySlug(slug: string) {
    return this.productService.getBySlug(slug);
  }

  @MessagePattern({ cmd: 'get-base-product-by-category-slug' })
  getBaseProductsByCategorySlug(data: {
    slug: string;
    page: number;
    limit: number;
    fromPrice?: number;
    toPrice?: number;
    sortBy?: string;
  }) {
    return this.productService.getProductsByCategorySlug(
      data.slug,
      data.fromPrice,
      data.toPrice,
      data.sortBy,
      data.page,
      data.limit,
    );
  }

  @MessagePattern({ cmd: 'get-base-product-by-brand-slug' })
  getBaseProductsByBrandSlug(data: {
    slug: string;
    page: number;
    limit: number;
    fromPrice?: number;
    toPrice?: number;
    sortBy?: string;
  }) {
    return this.productService.getProductsByBrandSlug(
      data.slug,
      data.fromPrice,
      data.toPrice,
      data.sortBy,
      data.page,
      data.limit,
    );
  }

  @MessagePattern({ cmd: 'search-base-product-by-name' })
  searchProductByName(data: {
    slug: string;
    page: number;
    limit: number;
    fromPrice?: number;
    toPrice?: number;
    sortBy?: string;
  }) {
    return this.productService.searchProductByName(
      data.slug,
      data.fromPrice,
      data.toPrice,
      data.sortBy,
      data.page,
      data.limit,
    );
  }

  @MessagePattern({ cmd: 'price-change-statistics' })
  priceChangeStatistics(data: PriceChangeStatisticsDto) {
    return this.productService.priceChangeStatistics(data);
  }
}
