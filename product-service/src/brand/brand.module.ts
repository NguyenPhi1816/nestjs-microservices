import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { ProductService } from 'src/product/product.service';
import { BaseProductDAO } from 'src/product/product.dao';

@Module({
  controllers: [BrandController],
  providers: [BaseProductDAO, BrandService, ProductService],
})
export class BrandModule {}
