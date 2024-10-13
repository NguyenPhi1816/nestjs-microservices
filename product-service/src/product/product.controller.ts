import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern } from '@nestjs/microservices';
import { Create_BP_Req } from './dto/base-product-requests/create-BP.dto';
import { Create_OVs } from './dto/option-value-requests/create-OVs.dto';
import { Create_PV_Req } from './dto/product-variant-requests/create-product-variant.dto';

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
}
