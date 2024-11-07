import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/constrants/enum/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('api/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  getAllBrands() {
    return this.brandService.getAllBrands();
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async createBrand(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    createBrandDto.image = file;
    return this.brandService.createBrand(createBrandDto);
  }

  @Put()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('newImage'))
  async updateBrand(
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    updateBrandDto.newImage = file;
    return this.brandService.updateBrand(updateBrandDto);
  }

  @Get('/product/:slug')
  getBrandProduct(@Param() param: { slug: string }) {
    return this.brandService.getBrandProducts(param.slug);
  }

  @Get('/:slug')
  getBrandBySlug(
    @Param() params: { slug: string },
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('fromPrice') fromPrice?: string,
    @Query('toPrice') toPrice?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.brandService.getBrandBySlug(
      params.slug,
      Number.parseFloat(fromPrice),
      Number.parseFloat(toPrice),
      sortBy,
      Number.parseInt(page),
      Number.parseInt(limit),
    );
  }
}
