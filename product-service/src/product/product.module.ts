import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { BaseProductDAO } from './product.dao';

@Module({
  controllers: [ProductController],
  providers: [ProductService, BaseProductDAO],
})
export class ProductModule {}
