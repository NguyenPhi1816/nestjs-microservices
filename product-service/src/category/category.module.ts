import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { ProductService } from 'src/product/product.service';
import { BaseProductDAO } from 'src/product/product.dao';

@Module({
  controllers: [CategoryController],
  providers: [BaseProductDAO, CategoryService, ProductService],
})
export class CategoryModule {}
