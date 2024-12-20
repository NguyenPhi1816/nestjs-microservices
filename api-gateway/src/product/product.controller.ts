import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
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
import AddBPImage from './dto/add-bp-image.dto';
import UpdateProductVariantDto from './dto/update-product-variant.dto';
import { Update_BaseProduct_Req } from './dto/update-bp.dto';
import { OptionalAuthGuard } from 'src/auth/guard/optional-auth.guard';
import GetProductStatisticsDto from './dto/get-product-statistics.dto';
import GetPurchasesStatisticsDto from './dto/get-purchases-statistics.dto';
import PriceChangeStatisticsDto from './dto/price-change-statistic.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

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

  @Get('client/products/:slug')
  @UseGuards(OptionalAuthGuard)
  getBPBySlug(@Param() param: { slug: string }, @Req() request: any) {
    return this.productService.getBPBySlug(param.slug, request.user);
  }

  @Post('products')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images to be uploaded
  async createProduct(
    @Body() createBaseProductDto: CreateBaseProductDto,
    @UploadedFiles() files: Express.Multer.File[], // Expect an array of files
  ) {
    if (files && files.length > 0) {
      createBaseProductDto.images = files;
    }
    return this.productService.createBaseProduct(createBaseProductDto);
  }

  @Put('products')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateProduct(@Body() data: Update_BaseProduct_Req) {
    return this.productService.updateBaseProduct(data);
  }

  @Put('products/status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateBaseProductStatus(
    @Body()
    data: Update_BaseProduct_Req,
  ) {
    return this.productService.updateBaseProductStatus(data);
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

  @Put('product-variants')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async updateProductVariant(
    @Body() updateProductVariantDto: UpdateProductVariantDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    updateProductVariantDto.image = file;
    return this.productService.updateProductVariant(updateProductVariantDto);
  }

  @Delete('products/image')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteBPImage(@Query() param: { id: string }) {
    return this.productService.deleteBPImage(param.id);
  }

  @Post('products/image')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images to be uploaded
  async addBPImage(
    @Body() data: AddBPImage,
    @UploadedFiles() files: Express.Multer.File[], // Expect an array of files
  ) {
    if (files && files.length > 0) {
      data.images = files;
    }
    return this.productService.addBPImage(data);
  }

  @Put('products/image')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async setBPMainImage(
    @Query() params: { baseProductId: string; imageId: string },
  ) {
    return this.productService.setBPMainImage(
      Number.parseInt(params.baseProductId),
      Number.parseInt(params.imageId),
    );
  }

  @Get('products/category/:slug')
  getBaseProductsByCategorySlug(
    @Param() param: { slug: string },
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('fromPrice') fromPrice?: string,
    @Query('toPrice') toPrice?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.productService.getProductsByCategorySlug(
      param.slug,
      Number.parseFloat(fromPrice),
      Number.parseFloat(toPrice),
      sortBy,
      Number.parseInt(page),
      Number.parseInt(limit),
    );
  }

  @Get('products/brand/:slug')
  getBaseProductsByBrandSlug(
    @Param() param: { slug: string },
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('fromPrice') fromPrice?: string,
    @Query('toPrice') toPrice?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.productService.getProductsByBrandSlug(
      param.slug,
      Number.parseFloat(fromPrice),
      Number.parseFloat(toPrice),
      sortBy,
      Number.parseInt(page),
      Number.parseInt(limit),
    );
  }

  @Get('products/search/:name')
  @UseGuards(OptionalAuthGuard)
  searchProductByName(
    @Req() request: any,
    @Param() param: { name: string },
    @Query('sortBy') sortBy: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('fromPrice') fromPrice?: string,
    @Query('toPrice') toPrice?: string,
  ) {
    return this.productService.searchProductByName(
      request.user,
      param.name,
      Number.parseFloat(fromPrice),
      Number.parseFloat(toPrice),
      sortBy,
      Number.parseInt(page),
      Number.parseInt(limit),
    );
  }

  @Post('products/statistics')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getProductStatistics(@Body() data: GetProductStatisticsDto) {
    return this.productService.getProductStatistics(data);
  }

  @Post('products/purchases/statistics')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getPurchasesStatistics(@Body() data: GetPurchasesStatisticsDto) {
    return this.productService.getPurchasesStatistics(data);
  }

  @Post('products/prices/statistics')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getPriceChangeStatistics(@Body() data: PriceChangeStatisticsDto) {
    return this.productService.priceChangeStatistics(data);
  }

  @Get('products/top-10/most-purchased')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getTop10MostPurchasedProducts() {
    return this.productService.getTop10MostPurchasedProducts();
  }

  @Get('categories/top-10/most-purchased')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getTop10MostPurchasedCategories() {
    return this.productService.getTop10MostPurchasedCategories();
  }

  @Get('calc-recommendation-data')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  calcRecommendationData() {
    return this.productService.calcRecommendationData();
  }

  @Get('get-matrix-data')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getMatrixData() {
    return this.productService.getMatrixData();
  }

  @Get('recommend-products')
  @UseGuards(OptionalAuthGuard)
  getRecommendProducts(
    @Req() request: any,
    @Query('limit') limit: string = '10',
  ) {
    let userId = -1;

    if (request.user) {
      userId = request.user.sub;
    }

    return this.productService.getRecommendProducts(
      userId,
      Number.parseInt(limit),
    );
  }
}
