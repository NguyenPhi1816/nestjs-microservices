import { Body, Controller } from '@nestjs/common';
import { CategoryService } from './category.service';
import { MessagePattern } from '@nestjs/microservices';
import CreateCategoryDto from './dto/create-category.dto';
import UpdateCategoryDto from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern({ cmd: 'get-all-categories' })
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @MessagePattern({ cmd: 'create-category' })
  createCategory(data: CreateCategoryDto) {
    return this.categoryService.createCategory(data);
  }

  @MessagePattern({ cmd: 'update-category' })
  updateCategory(data: UpdateCategoryDto) {
    return this.categoryService.updateCategory(data);
  }

  @MessagePattern({ cmd: 'get-category-children' })
  getCategoryChildren(slug: string) {
    return this.categoryService.getCategoryChildren(slug);
  }

  @MessagePattern({ cmd: 'get-category-products' })
  getCategoryProducts(slug: string) {
    return this.categoryService.getCategoryProducts(slug);
  }
}
