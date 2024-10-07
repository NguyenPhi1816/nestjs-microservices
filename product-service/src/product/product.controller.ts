import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateBaseProductDto } from './dto/create-base-product.dto';
import { CreateOptionValuesDto } from './dto/create-option-values.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'get-all-base-products' })
  getAllBaseProducts() {
    return this.productService.getAllBaseProduct();
  }

  @MessagePattern({ cmd: 'create-base-product' })
  createBaseProduct(data: CreateBaseProductDto) {
    return this.productService.createBaseProduct(data);
  }

  @MessagePattern({ cmd: 'create-option-values' })
  createOptionValues(data: CreateOptionValuesDto) {
    return this.productService.createOptionValues(data);
  }

  @MessagePattern({ cmd: 'create-product-variant' })
  createProductVariant(data: CreateProductVariantDto) {
    return this.productService.createProductVariant(data);
  }
}
