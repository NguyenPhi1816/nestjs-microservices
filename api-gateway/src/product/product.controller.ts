import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/constrants/enum/user-role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateBaseProductDto } from './dto/create-product.dto';
import { CreateOptionValuesDto } from './dto/create-option-values.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';

@Controller('api')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('products')
  getAllBaseProducts() {
    return this.productService.getAllBaseProducts();
  }

  @Get('products/:slug')
  getBySlug(@Param() param: { slug: string }) {
    return this.productService.getBySlug(param.slug);
  }

  @Post('products')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images to be uploaded
  async createCategory(
    @Body() createBaseProductDto: CreateBaseProductDto,
    @UploadedFiles() files: Express.Multer.File[], // Expect an array of files
  ) {
    if (files && files.length > 0) {
      createBaseProductDto.images = files;
    }
    return this.productService.createBaseProduct(createBaseProductDto);
  }

  @Post('option-values')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createOptionValues(
    @Body() createOptionValuesRequestDto: CreateOptionValuesDto,
  ) {
    return this.productService.createOptionValues(createOptionValuesRequestDto);
  }

  @Post('product-variants')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async createProductVariant(
    @Body() createProductVariantDto: CreateProductVariantDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    createProductVariantDto.image = file;
    return this.productService.createProductVariant(createProductVariantDto);
  }
}
