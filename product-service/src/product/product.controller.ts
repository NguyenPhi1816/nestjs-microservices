import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern } from '@nestjs/microservices';
import { Create_BP_Req } from './dto/base-product-requests/create-BP.dto';
import { Create_OVs } from './dto/option-value-requests/create-OVs.dto';
import { Create_PV_Req } from './dto/product-variant-requests/create-product-variant.dto';
import Add_BP_Image_Req from './dto/base-product-requests/add-BP-image.dto';
import UpdateProductVariantDto from './dto/product-variant-requests/update-product-variant.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'get-all-base-products' })
  getAllBaseProducts() {
    return this.productService.getAllBaseProduct();
  }

  @MessagePattern({ cmd: 'get-base-product-by-slug' })
  getBaseProductBySlug(slug: string) {
    return this.productService.getBySlugAdmin(slug);
  }

  @MessagePattern({ cmd: 'create-base-product' })
  createBaseProduct(data: Create_BP_Req) {
    return this.productService.createBaseProduct(data);
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
}
