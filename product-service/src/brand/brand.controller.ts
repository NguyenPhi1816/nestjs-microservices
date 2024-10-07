import { Controller } from '@nestjs/common';
import { BrandService } from './brand.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @MessagePattern({ cmd: 'get-all-brands' })
  getAllBrands() {
    return this.brandService.getAllBrands();
  }

  @MessagePattern({ cmd: 'create-brand' })
  createBrand(data: CreateBrandDto) {
    return this.brandService.createBrand(data);
  }

  @MessagePattern({ cmd: 'update-brand' })
  updateBrand(data: UpdateBrandDto) {
    return this.brandService.updateBrand(data);
  }

  @MessagePattern({ cmd: 'get-brand-products' })
  getBrandProducts(slug: string) {
    return this.brandService.getBrandProducts(slug);
  }
}
