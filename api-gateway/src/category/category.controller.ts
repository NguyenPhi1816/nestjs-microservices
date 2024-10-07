import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import CreateCategoryDto from './dto/create-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/constrants/enum/user-role.enum';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import UpdateCategoryDto from './dto/update-category.dto';

@Controller('api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    createCategoryDto.image = file;
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Put()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('newImage'))
  async updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    updateCategoryDto.newImage = file;
    return this.categoryService.updateCategory(updateCategoryDto);
  }

  @Get('/children/:slug')
  getCategoryChildren(@Param() param: { slug: string }) {
    const slug = param.slug;
    return this.categoryService.getCategoryChildren(slug);
  }

  @Get('/product/:slug')
  getCategoryProduct(@Param() param: { slug: string }) {
    return this.categoryService.getCategoryProducts(param.slug);
  }
}
